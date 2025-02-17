import {useSwitch, VisuallyHidden, SwitchProps} from "@heroui/react";
import {MoonIcon} from "./MoonIcon";
import {SunIcon} from "./SunIcon";

export const ThemeSwitch = (props: SwitchProps) => {
    const {
        Component,
        slots,
        isSelected,
        getBaseProps,
        getInputProps,
        getWrapperProps
    } = useSwitch(props);

    return (
        <div className="flex flex-col">
        <Component {...getBaseProps()}>
            <VisuallyHidden>
                <input {...getInputProps()} />
            </VisuallyHidden>
            <div
                {...getWrapperProps()}
                className={slots.wrapper({
                class: [
                    "w-8 h-8",
                    "flex items-center justify-center",
                    "rounded-lg bg-default-100 hover:bg-default-200 border border-indigo-400",
                ],
                })}
            >
                {isSelected ? <SunIcon className="text-yellow-400" /> : <MoonIcon/>}
            </div>
        </Component>
        </div>
    )
}


