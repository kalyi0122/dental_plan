import { Link } from 'react-router-dom'
import { Button, Card } from '../components/ui'

export function NotFoundPage() {
  return (
    <Card title="404" subtitle="Страница не найдена">
      <div className="muted" style={{ marginBottom: 12 }}>
        Такой страницы не существует или ссылка неверная.
      </div>
      <Link to="/patients">
        <Button variant="primary">На главную</Button>
      </Link>
    </Card>
  )
}

