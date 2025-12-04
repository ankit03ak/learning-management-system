import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { captureAndFinalizePaymentService } from "@/services";
import React, { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";

const PaypalPaymentReturnPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");



  useEffect(() => {
  if (payerId && paymentId) {
    const capturePayment = async () => {
      const currentOrderId = sessionStorage.getItem("currentOrderId");

      if (currentOrderId) {
        const response = await captureAndFinalizePaymentService({
          paymentId,
          payerId,
          orderId: currentOrderId,
        });

        if (response?.success) {
          sessionStorage.removeItem("currentOrderId");
          window.location.href = "/student-courses";
        }
      } else {
        toast.error("Order information not found. Please contact support.");
        return;
      }
    };
    capturePayment();
  } else {
    toast.error("Payment details missing. Please contact support.");
    return;
  }
}, [payerId, paymentId]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing payemnt... Please wait</CardTitle>
      </CardHeader>
    </Card>
  );
};

export default PaypalPaymentReturnPage;
