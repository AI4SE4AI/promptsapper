import {Container, Image, Nav, Navbar} from "react-bootstrap";
import React from "react";
const logoImage = process.env.PUBLIC_URL + '/logo.png';

const TopNavBar = () => {
    return (
        <Navbar  style={{height: "60px", backgroundColor: '#e2ebf0', border: '1px solid white'}}>
            <Navbar.Brand href="https://www.promptsapper.tech/sappercommunity">
                <Image
                    alt="logo"
                    src={logoImage}
                    width="35"
                    height="35"
                    className="d-inline-block align-top"
                />{' '}
                Prompt Sapper
            </Navbar.Brand>
            <Nav className="mr-auto">
                {/*<Nav.Link href="/HomePage">Home</Nav.Link>*/}
            </Nav>
        </Navbar>
    );
}

const BottomNavBar = () => {
    return (
        <Navbar fixed="bottom" bg="dark" variant="dark">
            <Container>
                <Navbar.Text>
                    &copy; {new Date().getFullYear()} Your Company Name
                </Navbar.Text>
            </Container>
        </Navbar>
    );
}

export {BottomNavBar, TopNavBar};
