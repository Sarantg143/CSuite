const {Router} = require('express')
const paymentRouter = Router()
const Payment = require('../models/Payment.model')

const { createCheckoutSession } = require('../models/Payment.model');

paymentRouter.get('/', async(req,res)=>{
    try{
        
        let payment =await Payment.find({})
        res.json({success : true ,message : "Payment completed ", payments : payment})

    }
    catch(e){
        res.status(400).json({success : false ,message : "Bad Request",error : e.message})

    }

})

paymentRouter.get('/:id', async(req,res)=>{
    try{
        
        let payment =await Payment.findById(req.params.id)
        if(!payment){
            res.status(404).json({success : false ,message : "Payment Not Found"})

        }
        else{

            res.status(200).json({success : true ,message : "Payment completed ",payments : payment})
        }

    }
    catch(e){
        res.status(400).json({success : false ,message : "Bad Request",error : e.message})

    }

})



paymentRouter.post('/', async(req,res)=>{
    try{
        const session = await stripe.checkout.sessions.retrieve(req.body.sessionId);
    
    // Check if payment is complete
    if (session.payment_status == 'paid') {
       const payment = new Payment({
            sessionId: session.id,
            amountPaid: session.amount_total,
            paymentStatus: session.payment_status
        });

        // Save to the database
        await payment.save();
        
        
        res.json({success : true ,message : "Payment completed ",data : payment})

        
    } else {
        // Payment not completed throw 400
                res.status(400).json({success : true ,message : "Payment not completed",data : session})

    }
    }
    catch(e){
        res.status(400).json({success : false ,message : "Bad Request",error : e.message})
    }

})



paymentRouter.post('/create-checkout-session', async (req, res) => {
    try {
        const item = [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: req.body.name,
                    },
                    unit_amount: Math.round(req.body.price * 100),
                },
                quantity: 1,
            },
        ];

        const response = await createCheckoutSession(item, req.body.id);
        res.json(response);
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = paymentRouter;
