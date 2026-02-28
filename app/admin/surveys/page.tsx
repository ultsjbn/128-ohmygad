import { Card, Typography } from "@snowball-tech/fractal";

export default function SurveysPage() {
    return (
        <div className="flex flex-col gap-3 font-sans border-2 border-fractal-border-default rounded-m shadow-brutal-2 p-4 bg-fractal-bg-body-white">
            <Typography variant="heading-2" className="font-wide font-bold text-fractal-text-default">
                Surveys
            </Typography>
            <Card color="body">
                <Typography variant="body-1">
                    Surveys go here
                </Typography>
            </Card>
        </div>
    );
}