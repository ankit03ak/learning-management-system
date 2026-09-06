import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { captureAndFinalizePaymentService } from "@/services";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const PaypalPaymentReturnPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    let isMounted = true;
    const capturePayment = async () => {
      if (!payerId || !paymentId) {
        toast.error("Payment details missing. Please contact support.");
        if (isMounted) setStatus("error");
        return;
      }

      const currentOrderId = sessionStorage.getItem("currentOrderId");
      if (!currentOrderId) {
        toast.error("Order information not found. Please contact support.");
        if (isMounted) setStatus("error");
        return;
      }

      try {
        const response = await captureAndFinalizePaymentService({
          paymentId,
          payerId,
          orderId: currentOrderId,
        });

        if (!response?.success) {
          throw new Error(response?.message || "Unable to complete payment.");
        }
        sessionStorage.removeItem("currentOrderId");
        if (isMounted) {
          setStatus("success");
          navigate("/student-courses", { replace: true });
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            error.message ||
            "Unable to complete payment. Please try again."
        );
        if (isMounted) setStatus("error");
      }
    };

    capturePayment();
    return () => {
      isMounted = false;
    };
  }, [navigate, payerId, paymentId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {status === "processing" ? (
            <span className="flex items-center gap-2">
              <ClipLoader size={18} />
              Processing payment... Please wait
            </span>
          ) : status === "error" ? (
            "Payment could not be completed"
          ) : (
            "Payment completed"
          )}
        </CardTitle>
        {status === "error" && (
          <button
            type="button"
            className="text-left text-indigo-600 underline"
            onClick={() => navigate("/student-courses")}
          >
            Return to My Courses
          </button>
        )}
      </CardHeader>
    </Card>
  );
};

export default PaypalPaymentReturnPage;
