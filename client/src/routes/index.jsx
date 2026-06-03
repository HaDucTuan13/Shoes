import App from '../App';
import Admin from '../pages/admin';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import DetailProduct from '../pages/DetailProduct';
import InfoUser from '../pages/InfoUser';
import LoginUser from '../pages/LoginUser';
import PaymentSucces from '../pages/PaymentSucces';
import Register from '../pages/Register';
import Blog from '../pages/Blog';
import BlogDetail from '../pages/DetailBlogPage';
import Contact from '../pages/Contact';
import ForgotPassword from '../pages/ForgotPassword';
import Category from '../pages/Category';

export const routes = [
    {
        path: '/login',
        component: <LoginUser />,
    },
    {
        path: '/',
        component: <App />,
    },
    {
        path: '/register',
        component: <Register />,
    },
    {
        path: '/admin',
        component: <Admin />,
    },
    {
        path: '/product/:id',
        component: <DetailProduct />,
    },
    {
        path: '/cart',
        component: <Cart />,
    },
    {
        path: '/checkout',
        component: <Checkout />,
    },
    {
        path: '/payment/success/:id',
        component: <PaymentSucces />,
    },
    {
        path: '/profile',
        component: <InfoUser />,
    },
    {
        path: '/order',
        component: <InfoUser />,
    },
    {
        path: '/warranty',
        component: <InfoUser />,
    },
    {
        path: '/blog',
        component: <Blog />,
    },
    {
        path: '/blog/:id',
        component: <BlogDetail />,
    },
    {
        path: '/contact',
        component: <Contact />,
    },
    {
        path: '/forgot-password',
        component: <ForgotPassword />,
    },
    {
        path: '/favourite',
        component: <InfoUser />,
    },
    {
        path: '/category',
        component: <Category />,
    },
];
