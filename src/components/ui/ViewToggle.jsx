import { LayoutGrid, List } from 'lucide-react'
import Button from './Button'

const ViewToggle = ({ viewMode, setViewMode }) => {
    return (
        <div className="flex items-center gap-1 glass rounded-lg p-1">
            <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="relative"
                aria-label="Vista en cuadrícula"
            >
                <LayoutGrid className="w-4 h-4" />
            </Button>
            
            <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                aria-label="Vista en lista"
            >
                <List className="w-4 h-4" />
            </Button>
        </div>
    )
}

export default ViewToggle