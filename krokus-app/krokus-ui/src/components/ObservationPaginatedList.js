import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Pagination from 'react-bootstrap/Pagination';
import ListGroup from 'react-bootstrap/ListGroup';
import { useNavigate } from 'react-router-dom'
export default function ObservationPaginatedList({ params, onObservationClick = () => { } }) {
    const [observations, setObservations] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const visibleObservations = observations ? observations.items : [];
    useEffect(() => {
        setPage(1);
    }, [params]);

    async function setPage(pageNumber) {
        const paramsWithPage = {
            pageIndex: pageNumber,
            ...params
        }
        const obs = await apiService.getObservations(paramsWithPage);
        setObservations(obs);
        setCurrentPage(pageNumber);
    }

    function handleObservationClick(id) {
        onObservationClick(id);
        navigate(`/map/observations/${id}`);
    }

    const totalPages = observations ? observations.totalPages : 0;
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
    const observationItems = visibleObservations.map(obs => 
        <ListGroup.Item key={obs.id} action onClick={e => handleObservationClick(obs.id, e)}>
            {obs.title}
        </ListGroup.Item>
    );
    const observationList =
        <ListGroup>
            {observationItems}
        </ListGroup>;
    const noObservationsMessage = <div>Brak obserwacji</div>;
    return (
        <>
            {isPagination && pagination}
            {visibleObservations.length > 0 ? observationList : noObservationsMessage}
        </>
    );


        

}