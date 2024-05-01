import stripePackage from 'stripe';

const stripe = new stripePackage(process.env.STRIPE_SECRET_KEY as string);

export const createPaymentIntent = async (amount: number, currency: string) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency,
    });

    return {
        clientSecret: paymentIntent.client_secret,
    };
};

export const createCheckoutSession = async (
    items: { price: number; name: string; quantity: number }[],
    returnUrl: string,
) => {
    const lineItems = await Promise.all(
        items.map(async (item) => {
            const product = await stripe.products.create({
                name: item.name,
            });

            const productPrice = await stripe.prices.create({
                product: product.id,
                unit_amount: item.price * 100,
                currency: 'pkr',
            });

            return {
                price: productPrice.id,
                quantity: item.quantity,
            };
        }),
    );

    const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        line_items: lineItems,
        mode: 'payment',
        return_url: returnUrl,
    });

    return { clientSecret: session.client_secret };
};

export const getSessionStatus = async () => {
    const sessionId = '';
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return {
        status: session.status,
    };
};
