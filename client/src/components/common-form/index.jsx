import { Button } from "../ui/button";
import FormControls from "./form-controls";
import PropTypes from "prop-types";

const CommonForm = ({
  handleSubmit,
  buttonText,
  formControls = [],
  formData,
  setFormData,
  isButtonDisabled,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <FormControls
        formControls={formControls}
        formData={formData}
        setFormData={setFormData}
      />
      <Button disabled={isButtonDisabled} type="submit" className="mt-5 w-full">
        {buttonText || "Submit"}
      </Button>
    </form>
  );
};

CommonForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
  formControls: PropTypes.array,
  formData: PropTypes.object,
  setFormData: PropTypes.func.isRequired,
  isButtonDisabled: PropTypes.bool,
};

export default CommonForm;
