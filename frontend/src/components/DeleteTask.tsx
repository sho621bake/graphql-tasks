import { useMutation } from '@apollo/client'
import DeleteIcon from '@mui/icons-material/Delete'
import { IconButton, Tooltip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { DELETE_TASK } from '../mutations/taskMutations'
import { GET_TASKS } from '../queries/taskQueries'

const DeleteTask = ({ id, userId }: { id: number; userId: number }) => {
    const [deleteTask] = useMutation<{ deleteTask: number }>(DELETE_TASK)
    const navigate = useNavigate()
    const handleDeleteTask = async () => {
        try {
            await deleteTask({
                variables: {
                    id,
                },
                refetchQueries: [
                    {
                        query: GET_TASKS,
                        variables: { userId },
                    },
                ],
            })
            alert('タスクを削除しました。')
        } catch (err) {
            const error = err as Error // 型を指定
            console.log(error.message)
            if (error.message === 'Unauthorized') {
                localStorage.removeItem('token')
                alert(
                    'トークンの有効期限が切れました。サインイン画面へ遷移します。',
                )
                navigate('/signin')
                return
            }
            alert('タスクの削除に失敗しました。')
        }
    }

    return (
        <div>
            <Tooltip title='編集'>
                <IconButton onClick={handleDeleteTask}>
                    <DeleteIcon color='action'></DeleteIcon>
                </IconButton>
            </Tooltip>
        </div>
    )
}

export default DeleteTask
