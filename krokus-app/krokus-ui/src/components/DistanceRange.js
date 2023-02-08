import Form from 'react-bootstrap/Form';

/**
 * A slider for selecting distance on a map.
 */
export default function DistanceRange({ min = 0.05, max = 10000, value, onChange = () => { } }) {

    function rangeValueToKm(rangeValue) {
        const a = min;
        const b = max / min;
        const km = a * Math.pow(b, rangeValue / 100);
        return km;
    }

    function kmToRangeValue(km) {
        const a = min;
        const b = max / min;
        const rangeValue = 100 * Math.log(km / a) / Math.log(b);
        return rangeValue;
    }

    function formatDisplayedValue(km) {
        if (km < 1) {
            return (km * 1000).toFixed(0) + ' m';
        }
        else if (km < 10) {
            return km.toFixed(1) + ' km';
        }
        else {
            return km.toFixed(0) + ' km';
        }
    }

    const kmValue = isNaN(parseFloat(value)) ? min : parseFloat(value);
    const rangeValue = kmToRangeValue(kmValue);
    function handleChange(e) {
        const val = parseFloat(e.currentTarget.value);
        const km = rangeValueToKm(val);
        onChange(km.toString());
    }

    return (
        <div>
            <Form.Range value={rangeValue} onChange={handleChange} />
            <div className="mt-1">
                {formatDisplayedValue(kmValue)}
            </div>
        </div>
    );
    
}