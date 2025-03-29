import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { LucideIcon } from "lucide-react";

interface FormInputProps {
    form: UseFormReturn<any>;
    name: string;
    label: string;
    placeholder?: string;
    type?: string;
    required?: boolean;
    small?: string;
    className?: string;
    icon?: LucideIcon;
    isLastItem?: boolean;
}

export const FormInput = ({
    form,
    name,
    label,
    placeholder,
    type = "text",
    required = false,
    small,
    className = "col-span-12 md:col-span-6  relative h-20",
    icon: Icon
}: FormInputProps) => {
    return (
        <FormField
            name={name}
            control={form.control}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel>
                        {label} {required && <span className="text-red-500">*</span>} {small && <small><i>{small}</i></small>}
                    </FormLabel>
                    <div className="relative">
                        <FormControl>
                            {name === "phoneNumber" ? (
                                <div className="relative">
                                    <span className="absolute left-3 top-[10px] text-gray-500 dark:text-gray-300 bg-slate-200 dark:bg-slate-900 rounded-md px-2  text-sm">
                                        +56 9
                                    </span>
                                    <Input
                                        {...field}
                                        type="tel"
                                        placeholder={placeholder}
                                        className="pl-[68px]"
                                    />
                                </div>
                            ) : (
                                <Input
                                    type={type}
                                    {...field}
                                    placeholder={placeholder}
                                />
                            )}
                        </FormControl>
                        {Icon && <Icon className="absolute top-[10px] right-2 transform" />}
                    </div>
                    <FormMessage className="text-red-600 dark:text-red-400 text-[12px] fade-in" />
                </FormItem>
            )}
        />
    );
};
