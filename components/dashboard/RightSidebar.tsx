export function RightSidebar() {
    return (
        <aside className="dashboard-right">
            <div className="right-card-pink">
                <span className="right-card-label">Upcoming</span>
                <span className="right-card-value">3 Events</span>
            </div>

            <div className="right-card-purple">
                <span className="right-card-label">Students</span>
                <span className="right-card-value">124</span>
            </div>

            <div className="right-card-purple">
                <span className="right-card-label">Courses</span>
                <span className="right-card-value">5</span>
            </div>
        </aside>
    );
}
