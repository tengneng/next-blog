import type { NextPage } from "next";
import Navbar from 'components/navbar';
import Footer from "components/footer";

const Layout: NextPage = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
};

export default Layout;