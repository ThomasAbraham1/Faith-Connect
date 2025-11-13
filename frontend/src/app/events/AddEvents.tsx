import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HookFormField } from "@/components/dynamic/HookFormField";
import { HookFormBody } from "@/components/dynamic/HookFormBody";
import * as lodash from "lodash";
import { useForm } from "react-hook-form";
import { SheetClose, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/dynamic/ModalProvider";



// Optional: pass event data when editing

export const AddEvents = (id: any) => {
    const ModalContext = useModal();
    const isEdit = !!id;
    let fields = {
        eventName: '',
        eventDate: '',
        eventLocation: '',
        organizer: '',
        description: ''
    }
    const { register, formState: { errors }, getValues, handleSubmit } = useForm({
        defaultValues: fields
    });


    function Submit(e:any) {
        console.log('Form Data', e);
        ModalContext.closeModal(true)

    }


    return (
        <>

            <form onSubmit={handleSubmit(Submit)}>

                <HookFormBody>
                    <HookFormField fieldName={'eventName'} errors={errors}>
                        <Input
                            id="eventName"
                            type="text"
                            {...register("eventName", { required: `${lodash.startCase('eventName')}` })}
                        />
                    </HookFormField>
                    <HookFormField fieldName={'eventDate'} errors={errors}>
                        <Input
                            id="eventDate"
                            type="date"
                            {...register("eventDate", { required: `${lodash.startCase('eventDate')}` })}
                        />
                    </HookFormField>
                    <HookFormField errors={errors} fieldName={'eventLocation'}>
                        <Input
                            id="eventLocation"
                            {...register("eventLocation", { required: `${lodash.startCase('eventLocation')}` })}
                        />
                    </HookFormField>
                    <HookFormField errors={errors} fieldName={'eventLocation'}>
                        <Label htmlFor="eventLocation">Location</Label>
                        <Input
                            id="eventLocation"
                            {...register("eventLocation", { required: `${lodash.startCase('eventDate')}` })}
                        />
                    </HookFormField>
                    <HookFormField errors={errors} fieldName={'eventLocation'}>
                        <Label htmlFor="organizer">Organizer</Label>
                        <Input
                            id="organizer"
                            {...register("organizer")}
                        />
                    </HookFormField>
                    <HookFormField errors={errors} fieldName={'eventLocation'}>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            rows={4}
                        />
                    </HookFormField>



                </HookFormBody>
                <SheetFooter className="sticky bottom-0 bg-background z-10">
                    <Button type="submit" className="w-full">
                        Submit
                    </Button>
                    <SheetClose asChild>
                        <Button variant="outline" onClick={() => ModalContext.closeModal(false)} >Close</Button>
                    </SheetClose>
                </SheetFooter>
            </form>
        </>
    )
}
