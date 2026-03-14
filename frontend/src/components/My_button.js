import '../styles/style.css';

const My_button = (props) => {
    return (
        <div>
            <button 
                value={props.value}
                onClick={props.onClick}
                className='b_button' 
                >
                    {props.title}
            </button>
        </div>
    );
};

export default My_button;