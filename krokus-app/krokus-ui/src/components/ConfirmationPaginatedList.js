import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Pagination from 'react-bootstrap/Pagination';
import ListGroup from 'react-bootstrap/ListGroup';
import { useNavigate } from 'react-router-dom'
export default function ConfirmationPaginatedList({ params }) {
    const [confirmations, setConfirmations] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const visibleConfirmations = confirmations ? confirmations.items : [];
    useEffect(() => {
        setPage(1);
    }, [params]);

    async function setPage(pageNumber) {
        const paramsWithPage = {
            pageIndex: pageNumber,
            ...params
        }
        const obs = await apiService.getConfirmations(paramsWithPage);
        setConfirmations(obs);
        setCurrentPage(pageNumber);
    }

    function handleConfirmationClick(conf) {
        navigate(`/map/observations/${conf.observationId}`);
    }

    const totalPages = confirmations ? confirmations.totalPages : 0;
    const paginationItems = [];
    for (let number = 1; number <= totalPages; number++) {
        paginationItems.push(
            <Pagination.Item key={number} active={number === currentPage} onClick={e => setPage(number)}>
                {number}
            </Pagination.Item>
        );
    }
    const pagination =
        <Pagination>
            {paginationItems}
        </Pagination>;
    const isPagination = totalPages > 1;
    const observationItems = visibleConfirmations.map(conf =>
        <ListGroup.Item key={conf.id} action onClick={e => handleConfirmationClick(conf, e)}>
            <Row>
                <Col xs={2} className={ conf.isConfirmed ? 'text-success' : 'text-danger' }>
                    {conf.isConfirmed ? 'Potwierdzam' : 'Nie potwierdzam'}
                </Col>
                <Col className="text-truncate">
                    {conf.description}
                </Col>
            </Row>
        </ListGroup.Item>
    );
    const confirmationList =
        <ListGroup>
            {observationItems}
        </ListGroup>;
    const noConfirmationsMessage = <div>Brak potwierdzeń</div>;
    return (
        <>
            {isPagination && pagination}
            {visibleConfirmations.length > 0 ? confirmationList : noConfirmationsMessage}
        </>
    );




}