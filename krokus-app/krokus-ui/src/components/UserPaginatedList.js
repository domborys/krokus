import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Pagination from 'react-bootstrap/Pagination';
import ListGroup from 'react-bootstrap/ListGroup';
import { useNavigate } from 'react-router-dom'
export default function UserPaginatedList({ params }) {
    const [users, setUsers] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const visibleUsers = users ? users.items : [];
    useEffect(() => {
        setPage(1);
    }, [params]);

    async function setPage(pageNumber) {
        const paramsWithPage = {
            pageIndex: pageNumber,
            ...params
        }
        const res = await apiService.getUsers(paramsWithPage);
        setUsers(res);
        setCurrentPage(pageNumber);
    }

    function handleUserClick(id) {
        navigate(`/users/${id}`);
    }

    const totalPages = users ? users.totalPages : 0;
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
    const userItems = visibleUsers.map(user =>
        <ListGroup.Item key={user.id} action onClick={e => handleUserClick(user.id, e)}>
            {user.username}
        </ListGroup.Item>
    );
    const userList =
        <ListGroup>
            {userItems}
        </ListGroup>;
    const noUsersMessage = <div>Nie znaleziono użytkowników</div>;
    return (
        <>
            {isPagination && pagination}
            {visibleUsers.length > 0 ? userList : noUsersMessage}
        </>
    );




}