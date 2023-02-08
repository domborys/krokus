import { MapContext } from '../services/contexts';
import { useContext } from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

/**
 * Inputs for setting polygon coordinates.
 */
export default function PolygonPointInputs({ pointIndex }) {
    const { selectedPolygon, setSelectedPolygon } = useContext(MapContext);

    function handlePolygonPointChange(e, coordIndex) {
        const newPolygon = [...selectedPolygon];
        const newPoint = [...selectedPolygon[pointIndex]];
        newPoint[coordIndex] = e.target.value;
        newPolygon[pointIndex] = newPoint;
        setSelectedPolygon(newPolygon);
    }
    return (
        <InputGroup>
            <Form.Control id={`polygonPoint${pointIndex}N`} type="text" value={selectedPolygon[pointIndex][0]} onChange={e => handlePolygonPointChange(e, 0)} placeholder="N" aria-label={`Punkt ${pointIndex + 1} wspó³rzêdna N`} />
            <Form.Control id={`polygonPoint${pointIndex}E`} type="text" value={selectedPolygon[pointIndex][1]} onChange={e => handlePolygonPointChange(e, 1)} placeholder="E" aria-label={`Punkt ${pointIndex + 1} wspó³rzêdna N`} />
        </InputGroup>
    );
}