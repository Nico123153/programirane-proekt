import React, { useEffect, useState } from "react";

type HistoryEntry = {
    id: number;
    investmentId: number;
    action: string;
    date: string;
    symbol: string | null;
};

const HistoryLog: React.FC = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/history")
            .then((res) => res.json())
            .then((data) => setHistory(data));
    }, []);

    return (
        <div className="card mt-4 border-secondary">
            <div className="card-body">
                <h5 className="card-title mb-3">History Log</h5>
                <ul className="list-group">
                    {history.length === 0 && (
                        <li className="list-group-item text-muted">No history yet.</li>
                    )}
                    {history.map((log) => (
                        <li className="list-group-item" key={log.id}>
                            <b>{log.action.toUpperCase()}</b> investment #{log.investmentId}
                            {log.symbol ? ` (${log.symbol})` : ""} at{" "}
                            {new Date(log.date).toLocaleString()}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default HistoryLog;
