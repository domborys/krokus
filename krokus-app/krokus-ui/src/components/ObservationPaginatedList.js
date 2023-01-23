import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Pagination from 'react-bootstrap/Pagination';
import ListGroup from 'react-bootstrap/ListGroup';
import { useNavigate } from 'react-router-dom'
export default function ObservationPaginatedList({ observations, onPageChange = () => { }, onObservationClick = () => { } }) {
    
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const visibleObservations = observations ? observations.items : [];
    

    function handleObservationClick(id) {
        onObservationClick(id);
        navigate(`/map/observations/${id}`);
    }

    async function handlePageChange(number) {
        await onPageChange(number);
        setCurrentPage(number);
    }

    const totalPages = observations ? observations.totalPages : 0;
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