import { useState } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import ListGroup from 'react-bootstrap/ListGroup';
import ConfirmationItem from '../components/ConfirmationItem';
import { useNavigate } from 'react-router-dom'
export default function ConfirmationPaginatedList({ confirmations, onPageChange = () => { } }) {
    
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const visibleConfirmations = confirmations ? confirmations.items : [];

    async function handlePageChange(number) {
        await onPageChange(number);
        setCurrentPage(number);
    }

    function handleConfirmationClick(conf) {
        navigate(`/map/observations/${conf.observationId}`);
    }

    async function handleConfirmationDelete() {
        await handlePageChange(currentPage);
    }

    const totalPages = confirmations ? confirmations.totalPages : 0;
    const paginationItems = [];
    for (let number = 1; number <= totalPages; number++) {
        paginationItems.push(
            <Pagination.Item key={number} active={number === currentPage} onClick={e => handlePageChange(number)}>
                {number}
            </Pagination.Item>
        );
    }
    const pagination =
        <Pagination>
            {paginationItems}
        </Pagination>;
    const isPagination = totalPages > 1;
    const confirmationItems = visibleConfirmations.map(conf =>
        <ConfirmationItem key={conf.id} confirmation={conf} onConfirmationDeleted={handleConfirmationDelete} onClick={e => handleConfirmationClick(conf, e)} />
    );
    const confirmationList =
        <ListGroup>
            {confirmationItems}
        </ListGroup>;
    const noConfirmationsMessage = <div>Brak potwierdzeń</div>;
    return (
        <>
            {isPagination && pagination}
            {visibleConfirmations.length > 0 ? confirmationList : noConfirmationsMessage}
        </>
    );




}