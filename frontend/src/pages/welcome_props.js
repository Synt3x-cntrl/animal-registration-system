const Welcome = (props) => {
    return (
        <h1>
            <p> Sain bnuu, {props.name}! </p>
            <p> tanii nas: {props.age}  </p>
        </h1>
    );
};

export default Welcome;