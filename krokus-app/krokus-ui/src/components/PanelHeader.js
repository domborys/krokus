import { useNavigate } from 'react-router-dom';

export default function PanelHeader({ children, onBack }) {
    const navigate = useNavigate();

    function handleBackClick() {
        if (typeof onBack === 'function') {
            onBack();
        }
        else {
            navigate(-1);
        }
    }

    return (
        <div className="border-bottom mb-2 d-flex align-items-center">
            <button className="arrow-back-button fs-3 px-2" aria-label="Poprzednia strona" onClick={handleBackClick}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{width:'1em', height:'1em'}} fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                </svg>
            </button>
            <h1 className="h3 border-start flex-fill my-0 ps-2 py-2">{children}</h1>
        </div>    
    );
}