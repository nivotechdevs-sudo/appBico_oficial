// How a job's schedule reads everywhere in the app. Date and hours are optional (a job
// can leave them to be arranged with the worker); `dias` says which part of the week
// the job can happen on.

export const DIAS = {
  semana: { label: 'Durante a semana', short: 'Seg a sex', hint: 'De segunda a sexta' },
  fimdesemana: { label: 'No fim de semana', short: 'Sáb e dom', hint: 'Sábado e domingo' },
  qualquer: { label: 'Qualquer dia', short: 'Qualquer dia', hint: 'Semana ou fim de semana' }
};
export const DIAS_ORDEM = ['semana', 'fimdesemana', 'qualquer'];

export function diasInfo(job) {
  return DIAS[job.dias] || null;
}

/** "Hoje", or "Data a combinar" when the job has no date. */
export function dateText(job) {
  return job.date || 'Data a combinar';
}

/** "Hoje · 7h–17h", "Hoje", "Data a combinar · 7h–17h" or "Data e horário a combinar". */
export function whenText(job) {
  if (job.date) return job.hours ? `${job.date} · ${job.hours}` : job.date;
  return job.hours ? `Data a combinar · ${job.hours}` : 'Data e horário a combinar';
}

export function hoursText(job) {
  return job.hours || 'Horário a combinar';
}
