const router = require("express").Router();

const {createOrder, capturePaymentAndFinalizeOrder} = require("../../controllers/student-controllers/order-controller")

router.post("/create", createOrder);
router.post("/capture", capturePaymentAndFinalizeOrder);

module.exports = router;
