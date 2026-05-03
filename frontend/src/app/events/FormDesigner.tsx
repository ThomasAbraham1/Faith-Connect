import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, AlertCircle, Save, Loader2, Lock, Info } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/api/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
}

interface FormDesignerProps {
  event: any;
  hasRegistrants: boolean;
}

export const FormDesigner: React.FC<FormDesignerProps> = ({ event, hasRegistrants }) => {
  const queryClient = useQueryClient();
  const [fields, setFields] = useState<FormField[]>(event.formFields || []);
  
  // Track raw options text locally to allow typing commas without immediate stripping
  const [optionsRaw, setOptionsRaw] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    (event.formFields || []).forEach((f: any) => {
      if (f.type === 'select' && f.options) {
        initial[f.name] = f.options.join(', ');
      }
    });
    return initial;
  });

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '_');
  };

  const addField = () => {
    if (hasRegistrants) return;
    if (fields.length >= 10) {
      toast.error('Maximum 10 custom fields allowed');
      return;
    }
    const name = `field_${Date.now()}`;
    const newField: FormField = {
      name,
      label: '',
      type: 'text',
      required: false,
      options: [],
    };
    setFields([...fields, newField]);
  };

  const removeField = (index: number) => {
    if (hasRegistrants) return;
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const mutation = useMutation({
    mutationFn: async (updatedFields: FormField[]) => {
      return api.patch(`/events/${event._id}`, { formFields: updatedFields });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', event._id] });
      toast.success('Form configuration saved!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save form');
    },
  });

  const handleSave = () => {
    // Validate: all fields must have a label
    if (fields.some((f) => !f.label.trim())) {
      toast.error('All custom fields must have a label');
      return;
    }
    mutation.mutate(fields);
  };

  const fixedFields = [
    { label: 'Name', type: 'Text', required: true },
    { label: 'Phone', type: 'Tel', required: true },
    { label: 'Email', type: 'Email', required: false },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle>Form Designer</CardTitle>
                {hasRegistrants && (
                  <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200 gap-1 px-1.5 h-5">
                    <Lock className="h-2.5 w-2.5" /> Structure Locked
                  </Badge>
                )}
              </div>
              <CardDescription>
                Design the registration form for this event. 
                Fixed fields are always included.
              </CardDescription>
            </div>
            <Badge variant={fields.length >= 10 ? 'destructive' : 'secondary'}>
              {fields.length} / 10 Custom Fields
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Fixed Fields Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Lock className="h-3 w-3" /> Fixed Fields
            </h4>
            <div className="grid gap-3">
              {fixedFields.map((field, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30 opacity-70">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{field.label}</p>
                    <p className="text-xs text-muted-foreground">{field.type} • {field.required ? 'Required' : 'Optional'}</p>
                  </div>
                  <Badge variant="outline">Locked</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Custom Fields Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Custom Fields</h4>
            
            {fields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-xl bg-muted/10">
                <p className="text-sm text-muted-foreground">No custom fields added yet.</p>
                {!hasRegistrants && (
                  <Button variant="link" onClick={addField} className="mt-1">
                    Click here to add your first field
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.name} className="p-4 rounded-xl border bg-card shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label>Field Label</Label>
                          <Input 
                            placeholder="e.g. Dietary Requirements" 
                            value={field.label}
                            onChange={(e) => updateField(index, { label: e.target.value })}
                            onBlur={(e) => {
                              if (!hasRegistrants && (!field.name || field.name.startsWith('field_'))) {
                                updateField(index, { name: slugify(e.target.value) });
                              }
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select 
                            value={field.type} 
                            onValueChange={(val) => updateField(index, { type: val })}
                            disabled={hasRegistrants}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="tel">Phone</SelectItem>
                              <SelectItem value="textarea">Long Text</SelectItem>
                              <SelectItem value="select">Dropdown</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col justify-center gap-2">
                          <Label>Required</Label>
                          <div className="flex items-center h-10">
                            <Switch 
                              checked={field.required}
                              onCheckedChange={(val) => updateField(index, { required: val })}
                              disabled={hasRegistrants}
                            />
                          </div>
                        </div>

                        <div className="flex items-end justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => removeField(index)}
                            disabled={hasRegistrants}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {field.type === 'select' && (
                      <div className="space-y-2 pt-2 border-t border-border/50">
                        <Label>Options (comma separated)</Label>
                        <Input 
                          placeholder="Small, Medium, Large"
                          value={optionsRaw[field.name] ?? field.options?.join(', ')}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOptionsRaw(prev => ({ ...prev, [field.name]: val }));
                            updateField(index, { 
                              options: val.split(',').map(s => s.trim()).filter(Boolean) 
                            });
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={addField} 
                disabled={fields.length >= 10 || hasRegistrants}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Add Field
              </Button>
              <Button 
                onClick={handleSave} 
                className="gap-2 sm:ml-auto"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasRegistrants ? (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3 text-blue-600">
          <Info className="h-5 w-5 flex-shrink-0" />
          <p className="text-xs leading-relaxed">
            <strong>Form is partially locked:</strong> Since people have already registered, you cannot add or remove fields, or change their types. 
            However, you can still fix typos in the labels or update dropdown options.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-xs leading-relaxed">
            <strong>Tip:</strong> Finalize your form structure before opening registration. 
            Once the first person registers, adding or removing fields will be disabled to keep your data consistent.
          </p>
        </div>
      )}
    </div>
  );
};
