import { Card, Typography, Paper } from "@snowball-tech/fractal";
import { GenderPieChart } from "@/components/gender-pie-chart";
import { getGenderDistribution } from "@/lib/actions/gender";
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"; 
// import { cookies } from "next/headers";

export default async function DashboardPage() {
  const genderData = await getGenderDistribution();
  // const supabase = createServerComponentClient({ cookies });
  // const { data: { session } } = await supabase.auth.getSession();

  return (
    <div className="max-w-7xl">
      {/* Welcome */}
      <div className="mb-8">
        <Typography variant="heading-1">
          Welcome,<br />
        </Typography>
        <Typography variant="heading-2">KASARIAN Admin Yipee</Typography>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT COLUMN: Event Analytics */}
        <Paper elevation="elevated" title="Event Analytics" titleVariant="heading-4">
          
          {/* Wide Light Blue Card */}
          <div className="bg-[#E0F7FA] border-[3px] border-black rounded-xl p-6 min-h-[180px]">
            <Typography variant="body-1-median">Analytics Card Wide</Typography>
          </div>

          {/* Bottom row of Event Analytics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#E6E6FA] border-[3px] border-black rounded-xl p-6 min-h-[160px]">
              <Typography variant="body-1-median">Analytics Card</Typography>
            </div>
            <div className="bg-[#FFF9C4] border-[3px] border-black rounded-xl p-6 min-h-[160px]">
              <Typography variant="body-1-median">Analytics Card</Typography>
            </div>
          </div>
        </Paper>

        {/* MIDDLE COLUMN: Gender Pie Chart & Total Analytics */}
        <div className="col-span-1 flex flex-col gap-6">
          <Card className="flex-1 bg-white p-6 border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[250px]">
            <Typography variant="heading-3">Sex and Gender<br/>Distribution Pie Chart</Typography>
            <GenderPieChart data={genderData} />
          </Card>
          <Card className="flex-1 bg-white p-6 border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[200px]">
            <Typography variant="heading-3">Total Analytics</Typography>
          </Card>
        </div>

        {/* RIGHT COLUMN: Roles & Breakdown */}
        <div className="col-span-1 flex flex-col gap-6">
          <Card className="flex-1 bg-white p-6 border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[220px]">
            <Typography variant="heading-3">Users by Role</Typography>
          </Card>
          <Card className="flex-1 bg-white p-6 border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[230px]">
            <Typography variant="heading-3">Breakdown Analytics</Typography>
          </Card>
        </div>
      </div>
    </div>
  );
}