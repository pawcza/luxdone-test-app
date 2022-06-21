import styled from 'styled-components';
import Chart from "./components/Chart";

const App = () => {
    return <Container>
            <Chart/>
        </Container>
}

export default App;

export const Container = styled.div`
    margin: 0 auto;
    width: 100%;
    max-width: 1280px;
    position: relative;
    overflow-x: hidden;
`;
