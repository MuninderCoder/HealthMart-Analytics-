import { motion } from 'framer-motion'
import { Activity, Pill, UserCheck, Users, ShieldAlert, BarChart3, TrendingUp } from 'lucide-react'

function ProgressBarItem({ name, count, pct, color = 'bg-blue-500', idx = 0 }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-slate-700 truncate max-w-[150px]">{name}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-slate-900 font-bold">{count.toLocaleString()}</span>
          <span className="text-slate-400 text-[10px]">({pct}%)</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: idx * 0.05 }}
        />
      </div>
    </div>
  )
}

export default function AnalyticsOverview({ overview }) {
  if (!overview) return null
  const { diseases, medicines, doctors, departments, symptoms, genderDist, ageGroups } = overview

  // Check if we have any data to show
  const hasDiseases = diseases.items && diseases.items.length > 0
  const hasMedicines = medicines.items && medicines.items.length > 0
  const hasDoctors = doctors.items && doctors.items.length > 0
  const hasDepts = departments.items && departments.items.length > 0
  const hasSymptoms = symptoms.items && symptoms.items.length > 0

  return (
    <div className="space-y-6">
      {/* Overview main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        
        {/* Diseases widget */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                  <Activity className="w-4.5 h-4.5 text-rose-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Top Diseases / Diagnoses</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {diseases.col ? `Column: "${diseases.col}"` : 'Diagnostic Column'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                {diseases.unique} unique
              </span>
            </div>

            {hasDiseases ? (
              <div className="space-y-3">
                {diseases.items.map((item, idx) => (
                  <ProgressBarItem
                    key={item.name}
                    name={item.name}
                    count={item.count}
                    pct={item.pct}
                    color="bg-rose-500"
                    idx={idx}
                  />
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-slate-400">
                No disease/diagnosis column detected.
              </div>
            )}
          </div>
        </div>

        {/* Medicines widget */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Pill className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Top Medicines Prescribed</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {medicines.col ? `Column: "${medicines.col}"` : 'Prescription Column'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                {medicines.unique} unique
              </span>
            </div>

            {hasMedicines ? (
              <div className="space-y-3">
                {medicines.items.map((item, idx) => (
                  <ProgressBarItem
                    key={item.name}
                    name={item.name}
                    count={item.count}
                    pct={item.pct}
                    color="bg-emerald-500"
                    idx={idx}
                  />
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-slate-400">
                No medicine/drug column detected.
              </div>
            )}
          </div>
        </div>

        {/* Age Groups & Gender */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6">
          {/* Gender */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-3.5">
              <Users className="w-4 h-4 text-blue-500" />
              Gender Distribution
            </h4>
            
            {genderDist ? (
              <div className="space-y-3">
                {genderDist.map((item, idx) => (
                  <ProgressBarItem
                    key={item.name}
                    name={item.name}
                    count={item.count}
                    pct={item.pct}
                    color={idx === 0 ? 'bg-blue-500' : 'bg-pink-500'}
                    idx={idx}
                  />
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No gender column detected in dataset.
              </div>
            )}
          </div>

          {/* Age Groups */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-3.5">
              <TrendingUp className="w-4 h-4 text-violet-500" />
              Age Demographics
            </h4>
            
            {ageGroups ? (
              <div className="space-y-3">
                {ageGroups.map((item, idx) => (
                  <ProgressBarItem
                    key={item.name}
                    name={item.name}
                    count={item.count}
                    pct={item.pct}
                    color="bg-violet-500"
                    idx={idx}
                  />
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No age demographics detected in dataset.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Doctor & Department details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Doctors */}
        {hasDoctors && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-4">
              <UserCheck className="w-4.5 h-4.5 text-blue-500" />
              Consulting Physicians ({doctors.unique} total)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {doctors.items.map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex flex-col justify-center">
                  <span className="text-xs font-bold text-slate-800 truncate" title={doc.name}>
                    {doc.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold mt-1">
                    {doc.count.toLocaleString()} visits
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Departments */}
        {hasDepts && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-4">
              <BarChart3 className="w-4.5 h-4.5 text-indigo-500" />
              Department Load ({departments.unique} total)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {departments.items.map((dept, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex flex-col justify-center text-center">
                  <span className="text-[10px] font-extrabold text-slate-700 truncate" title={dept.name}>
                    {dept.name}
                  </span>
                  <span className="text-[9px] text-slate-450 font-bold mt-1">
                    {dept.count.toLocaleString()} cases
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
