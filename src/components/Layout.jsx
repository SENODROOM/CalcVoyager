import Header from "./Header";
import Footer from "./Footer";

function layout(props){
    return (
        <>
        <Header/>
        {props.body}
        <Footer/>
        </>
    )

}

export default layout;