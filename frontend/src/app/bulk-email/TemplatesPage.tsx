import React, { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import JoditEditor from 'jodit-react';
import api from '@/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Save, Trash2, Edit2, ArrowLeft, Info } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Template {
  _id: string;
  name: string;
  subject: string;
  body: string;
  churchId: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

const editorConfig = {
  readonly: false,
  height: 500,
  toolbarAdaptive: false,
  buttons: [
    'source', '|',
    'bold', 'strikethrough', 'underline', 'italic', '|',
    'ul', 'ol', '|',
    'font', 'fontsize', 'brush', 'paragraph', '|',
    'image', 'table', 'link', '|',
    'align', 'undo', 'redo', '|',
    'hr', 'fullsize',
  ],
  placeholder: 'Start typing your template here...',
};

const placeholders = [
  { label: 'First Name', value: '{{firstName}}' },
  { label: 'Last Name', value: '{{lastName}}' },
  { label: 'User Name', value: '{{userName}}' },
  { label: 'Email', value: '{{email}}' },
  { label: 'Phone', value: '{{phone}}' },
];

export const TemplatesPage = () => {
  const queryClient = useQueryClient();
  const editor = useRef<any>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<Template>>({
    name: '',
    subject: '',
    body: ''
  });

  // Fetch Templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await api.get('/templates');
      return response.data.data;
    },
  });

  // Create/Update Mutation
  const mutation = useMutation({
    mutationFn: async (template: Partial<Template>) => {
      if (template._id) {
        return api.patch(`/templates/${template._id}`, template);
      }
      return api.post('/templates', template);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success(currentTemplate._id ? 'Template updated' : 'Template created');
      setIsEditing(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to save template');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template deleted');
    },
  });

  const resetForm = () => {
    setCurrentTemplate({ name: '', subject: '', body: '' });
  };

  const handleEdit = (template: Template) => {
    setCurrentTemplate(template);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentTemplate.name?.trim() || !currentTemplate.subject?.trim() || !currentTemplate.body?.trim()) {
      toast.error('Name, Subject, and Body are required');
      return;
    }
    mutation.mutate(currentTemplate);
  };

  const insertPlaceholder = (value: string) => {
    if (editor.current) {
      editor.current.focus();
      editor.current.execCommand('inserthtml', false, value);
    } else {
      // Fallback if editor not ready
      setCurrentTemplate(prev => ({
        ...prev,
        body: (prev.body || '') + value
      }));
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading templates...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-sm md:text-base text-muted-foreground">Create and manage your rich text email templates with dynamic variables.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => { resetForm(); setIsEditing(true); }} className="gap-2 h-9 text-xs md:text-sm md:h-10">
            <Plus className="h-4 w-4" /> New Template
          </Button>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates?.length === 0 ? (
            <Card className="col-span-full border-dashed p-10 text-center">
              <CardDescription>No templates found. Click "New Template" to get started.</CardDescription>
            </Card>
          ) : (
            templates?.map((template: Template) => (
              <Card key={template._id} className="hover:shadow-md transition-all group overflow-hidden flex flex-col h-full">
                <div className="relative h-40 w-full bg-slate-50 border-b overflow-hidden">
                  <div className="absolute inset-0 origin-top-left p-4" style={{ width: '400%', height: '400%', transform: 'scale(0.25)' }}>
                    <div 
                      className="bg-white p-8 shadow-sm h-full w-full overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: template.body }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                </div>
                <CardHeader className="p-4 flex-grow">
                  <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">{template.subject}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                    <Edit2 className="h-3 w-3 mr-2" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the template "{template.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(template._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setIsEditing(false)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Templates
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>{currentTemplate._id ? 'Edit Template' : 'Create New Template'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tpl-name">Internal Name</Label>
                  <Input 
                    id="tpl-name" 
                    placeholder="e.g., Welcome Email" 
                    value={currentTemplate.name}
                    onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">Only visible to you in the dashboard.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tpl-subject">Email Subject</Label>
                  <Input 
                    id="tpl-subject" 
                    placeholder="e.g., Welcome to the Church, {{firstName}}!" 
                    value={currentTemplate.subject}
                    onChange={(e) => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">The subject line your members will see.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Message Content</Label>
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium">Click to insert:</span>
                    <div className="flex gap-1">
                      {placeholders.map((p) => (
                        <Button 
                          key={p.value} 
                          type="button"
                          variant="secondary" 
                          size="sm" 
                          className="h-7 text-[10px] px-2"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => insertPlaceholder(p.value)}
                        >
                          {p.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <JoditEditor
                    ref={editor}
                    value={currentTemplate.body || ''}
                    config={editorConfig}
                    onBlur={(newContent) => setCurrentTemplate({ ...currentTemplate, body: newContent })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={mutation.isPending}>
                  <Save className="h-4 w-4 mr-2" /> {mutation.isPending ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
