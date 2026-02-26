interface DashboardHeaderProps {
    facultyName?: string;
}

export function DashboardHeader({ facultyName = "Faculty" }: DashboardHeaderProps) {
    return (
        <header className="dashboard-header">
            <h1>Welcome, {facultyName}</h1>
            <input
                className="search-bar"
                type="text"
                placeholder="Search events, students, courses…"
                readOnly
            />
            <hr className="header-divider" />
        </header>
    );
}
