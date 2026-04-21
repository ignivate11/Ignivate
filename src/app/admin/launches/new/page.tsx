import LaunchForm from '../LaunchForm'

export default function NewLaunchPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Admin / Launches</p>
        <h1 className="text-3xl font-bold text-white">New Launch</h1>
      </div>
      <LaunchForm />
    </div>
  )
}
