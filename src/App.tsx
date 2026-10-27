import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'

type Category = 'Estudo' | 'Projeto' | 'Pessoal'
type Priority = 'Baixa' | 'Média' | 'Alta'
type Filter = 'Todas' | 'Pendentes' | 'Concluídas'
type Task = { id: string; title: string; category: Category; priority: Priority; completed: boolean }
const STORAGE_KEY = 'focusboard.tasks.v1'

function Icon({ name }: { name: 'check' | 'trash' | 'plus' | 'spark' }) {
  const paths = {
    check: <path d="m5 12 4 4L19 6" />,
    trash: <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 11v5M14 11v5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z" /></>,
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function readTasks(): Task[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) as Task[] : []
  } catch {
    return []
  }
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(readTasks)
  const [filter, setFilter] = useState<Filter>('Todas')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('Projeto')
  const [priority, setPriority] = useState<Priority>('Média')

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)) }, [tasks])

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    if (filter === 'Pendentes') return !task.completed
    if (filter === 'Concluídas') return task.completed
    return true
  }), [filter, tasks])
  const completed = tasks.filter((task) => task.completed).length
  const pending = tasks.length - completed
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
  const date = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) return
    setTasks((current) => [{ id: crypto.randomUUID(), title: cleanTitle, category, priority, completed: false }, ...current])
    setTitle('')
  }

  function toggleTask(id: string) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task))
  }

  function removeTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id))
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Focusboard, início"><span className="brand-mark"><Icon name="spark" /></span>focus<span className="brand-light">board</span></a>
        <div className="topbar-right"><span className="sync-status"><span className="status-dot" /> salvo neste dispositivo</span><span className="avatar">F</span></div>
      </header>
      <main>
        <section className="welcome">
          <div><p className="eyebrow">SEU ESPAÇO DE FOCO</p><h1>Um passo de cada vez<span>.</span></h1><p className="welcome-copy">Organize o que importa e acompanhe seu progresso.</p></div>
          <div className="date-chip"><span className="date-icon">◷</span>{date}</div>
        </section>

        <section className="stats-grid" aria-label="Resumo das tarefas">
          <article className="stat-card"><div className="stat-top"><span className="stat-icon violet"><Icon name="spark" /></span><span className="stat-label">TAREFAS NO TOTAL</span></div><div className="stat-value">{tasks.length}<span> tarefas</span></div><p className="stat-foot">Seu plano em um só lugar</p></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-icon amber">◷</span><span className="stat-label">EM ANDAMENTO</span></div><div className="stat-value">{pending}<span> pendentes</span></div><p className="stat-foot">Escolha uma e comece agora</p></article>
          <article className="stat-card progress-card"><div className="stat-top"><span className="stat-icon green"><Icon name="check" /></span><span className="stat-label">PROGRESSO</span><span className="progress-number">{progress}%</span></div><div className="progress-track" role="progressbar" aria-label="Progresso das tarefas" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: progress + '%' }} /></div><p className="stat-foot">{completed} de {tasks.length} tarefas concluídas</p></article>
        </section>

        <section className="workspace">
          <div className="task-panel">
            <div className="panel-heading"><div><p className="eyebrow">ORGANIZAÇÃO</p><h2>Minhas tarefas</h2></div><span className="task-count">{pending} abertas</span></div>
            <div className="filters" role="tablist" aria-label="Filtrar tarefas">{(['Todas', 'Pendentes', 'Concluídas'] as Filter[]).map((item) => <button key={item} className={filter === item ? 'filter-button active' : 'filter-button'} onClick={() => setFilter(item)} role="tab" aria-selected={filter === item}>{item}</button>)}</div>
            <div className="task-list">
              {visibleTasks.length === 0 ? <div className="empty-state"><span className="empty-icon"><Icon name="check" /></span><h3>{tasks.length === 0 ? 'Sua lista começa aqui' : 'Nada por aqui ainda'}</h3><p>{tasks.length === 0 ? 'Adicione uma tarefa ao lado e transforme seus planos em progresso.' : 'Experimente trocar o filtro ou adicionar uma nova tarefa.'}</p></div> : visibleTasks.map((task) => (
                <article className={task.completed ? 'task-row completed' : 'task-row'} key={task.id}>
                  <button className="check-button" onClick={() => toggleTask(task.id)} aria-label={task.completed ? 'Marcar como pendente' : 'Concluir tarefa'}><Icon name="check" /></button>
                  <div className="task-main"><h3>{task.title}</h3><div className="task-meta"><span className="category-tag">{task.category}</span><span className={'priority-dot ' + task.priority.toLowerCase()} />{task.priority}</div></div>
                  <button className="icon-button delete-button" onClick={() => removeTask(task.id)} aria-label={'Excluir tarefa: ' + task.title}><Icon name="trash" /></button>
                </article>
              ))}
            </div>
            {completed > 0 && <button className="clear-button" onClick={() => setTasks((current) => current.filter((task) => !task.completed))}>Limpar tarefas concluídas</button>}
          </div>
          <aside className="side-column">
            <form className="create-card" onSubmit={addTask}>
              <div className="create-heading"><span className="create-icon"><Icon name="plus" /></span><div><p className="eyebrow">TIRE DA CABEÇA</p><h2>Nova tarefa</h2></div></div>
              <label className="field-label" htmlFor="task-title">O que você precisa fazer?</label>
              <input id="task-title" className="text-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: finalizar meu projeto..." maxLength={120} required />
              <div className="field-row">
                <label><span className="field-label">Categoria</span><select className="select-input" value={category} onChange={(event) => setCategory(event.target.value as Category)}><option>Projeto</option><option>Estudo</option><option>Pessoal</option></select></label>
                <label><span className="field-label">Prioridade</span><select className="select-input" value={priority} onChange={(event) => setPriority(event.target.value as Priority)}><option>Baixa</option><option>Média</option><option>Alta</option></select></label>
              </div>
              <button className="submit-button" type="submit"><Icon name="plus" />Adicionar tarefa</button><p className="form-hint">Pequenas entregas também contam.</p>
            </form>
            <div className="tip-card"><span className="tip-icon"><Icon name="spark" /></span><div><p className="tip-title">Dica de foco</p><p className="tip-copy">Escolha uma tarefa e dê a ela sua atenção por 25 minutos.</p></div></div>
          </aside>
        </section>
        <footer className="page-footer"><span>FOCUSBOARD <span className="footer-dot">·</span> FEITO PARA UM DIA DE CADA VEZ</span><span>Seus dados ficam apenas neste navegador.</span></footer>
      </main>
    </div>
  )
}

export default App
