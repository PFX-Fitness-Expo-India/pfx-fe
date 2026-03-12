import Header from '../features/header/Header';
import Footer from '../features/footer/Footer';

/**
 * PageLayout — the page shell that wraps all content.
 * Renders the sticky Header, main content area, and Footer.
 */
export default function PageLayout({ children }) {
  return (
    <div className="page-wrapper">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
