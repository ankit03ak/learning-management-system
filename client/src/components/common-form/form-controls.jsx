import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const FormControls = ({ formControls = [], formData, setFormData }) => {
  const [visiblePasswords, setVisiblePasswords] = React.useState({});

  const togglePasswordVisibility = (controlName) => {
    setVisiblePasswords((currentVisibility) => ({
      ...currentVisibility,
      [controlName]: !currentVisibility[controlName],
    }));
  };

  const renderComponentByType = (getControlItem) => {
    
    if (!getControlItem) {
      toast.warning("Some form control item is missing");
      return null;
    }
    
    
    let element = null;

    const currentControlItemValue = formData[getControlItem.name] || "";

    switch (getControlItem.componentType) {
      case "input":
        element = (
          <div className="relative">
            <Input
              id={getControlItem.name}
              name={getControlItem.name}
              placeholder={getControlItem.placeholder}
              type={
                getControlItem.type === "password" &&
                visiblePasswords[getControlItem.name]
                  ? "text"
                  : getControlItem.type
              }
              className={`w-full ${
                getControlItem.type === "password" ? "pr-11" : ""
              }`}
              value={currentControlItemValue}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  [getControlItem.name]: event.target.value,
                })
              }
            />
            {getControlItem.type === "password" ? (
              <button
                type="button"
                aria-label={
                  visiblePasswords[getControlItem.name]
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                onClick={() => togglePasswordVisibility(getControlItem.name)}
              >
                {visiblePasswords[getControlItem.name] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            ) : null}
          </div>
        );
        break;

      case "select":
        element = (
          <Select
            onValueChange={(value) =>
              setFormData({ ...formData, [getControlItem.name]: value })
            }
            value={currentControlItemValue}
          >
            <SelectTrigger>
              <SelectValue placeholder={getControlItem.label} />
            </SelectTrigger>
            <SelectContent>
              {getControlItem.options && getControlItem.options.length > 0
                ? getControlItem.options.map((optionItem) => (
                    <SelectItem key={optionItem.id} value={optionItem.id}>
                      {optionItem.label}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
        );
        break;

      case "textarea":
        element = (
          <Textarea
            id={getControlItem.name}
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            type={getControlItem.type}
            className="w-full"
            value={currentControlItemValue}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          ></Textarea>
        );
        break;
      case "checkbox":
        element = <Checkbox></Checkbox>;
        break;

      default:
        element = (
          <Input
            id={getControlItem.name}
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            type={getControlItem.type}
            className="w-full"
            value={currentControlItemValue}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          ></Input>
        );
        break;
    }
    return element;
  };

  

  return (
    <div className="flex flex-col gap-3">
      {formControls.map((controleItem) => (
        <div key={controleItem.name} className="flex flex-col">
          <Label className="text-left mb-2" htmlFor={controleItem.name}>
            {controleItem.label}
          </Label>
          {renderComponentByType(controleItem)}
        </div>
      ))}
    </div>
  );
};

export default FormControls;
