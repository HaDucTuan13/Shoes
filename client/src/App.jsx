import './App.css';
import Banner from './components/Banner';
import BlogHome from './components/BlogHome';
import Category from './components/Category';
import Chatbot from './components/ChatBot';
import Counpon from './components/Counpon';
import FeedbackHome from './components/FeedbackHome';
import FlashSale from './components/FlashSale';
import Footer from './components/Footer';
import Header from './components/Header';
import ModalChat from './components/chat/ModalChat';

function App() {
    return (
        <div>
            <header>
                <Header />
            </header>

            <main>
                <Banner />
                <Counpon />
                <FlashSale />
                <Category />
                <FeedbackHome />
                {/* <BlogHome /> */}
                <ModalChat />
                <Chatbot />
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default App;
