import { useMutation } from '@apollo/client'
import EditIcon from '@mui/icons-material/Edit'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UPDATE_TASK } from '../mutations/taskMutations'
import { GET_TASKS } from '../queries/taskQueries'
import { Task } from '../types/task'
import { TaskStatus } from '../types/taskStatus'

export default function EditTask({
    task,
    userId,
}: {
    task: Task
    userId: number
}) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(task.name)
    const [dueDate, setDueDate] = useState(task.dueDate)
    const [description, setDescription] = useState(task.description)
    const [status, setStatus] = useState(task.status)
    const [isInvalidName, setIsInvalidName] = useState(false)
    const [isInvalidDueDate, setIsInvalidDueDate] = useState(false)
    const navigate = useNavigate()
    const [updateTask] = useMutation<{ updateTask: Task }>(UPDATE_TASK)

    const resetState = () => {
        setName(task.name)
        setDueDate(task.dueDate)
        setDescription(task.description)
        setStatus(task.status)
        setIsInvalidName(false)
        setIsInvalidDueDate(false)
    }

    const handleEditTask = async () => {
        let canEdit = true
        if (name.length === 0) {
            canEdit = false
            setIsInvalidName(true)
        } else {
            setIsInvalidName(false)
        }

        if (!Date.parse(dueDate)) {
            canEdit = false
            setIsInvalidDueDate(true)
        } else {
            setIsInvalidDueDate(false)
        }

        if (canEdit) {
            const updateTaskInput = {
                id: task.id,
                name,
                dueDate,
                status,
                description,
            }

            try {
                await updateTask({
                    variables: { updateTaskInput },
                    refetchQueries: [
                        { query: GET_TASKS, variables: { userId } },
                    ],
                })
                resetState()
                setOpen(false)
            } catch (err) {
                const error = err as Error // 型を指定
                console.log(error.message)
                if (error.message === 'Unauthorized') {
                    localStorage.removeItem('token')
                    alert(
                        'トークンの有効期限が切れました。サインイン画面に遷移します。',
                    )
                    navigate('/signin')
                    return
                }

                alert('タスクの編集に失敗しました。')
            }
        }
    }
    const handleClickOpen = () => {
        resetState()
        setOpen(true)
    }

    const handleClose = () => {
        resetState()
        setOpen(false)
    }

    return (
        <div>
            <Tooltip title='編集'>
                <IconButton onClick={handleClickOpen}>
                    <EditIcon color='action'></EditIcon>
                </IconButton>
            </Tooltip>
            <Dialog
                fullWidth={true}
                maxWidth='sm'
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>Edit Task</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin='normal'
                        id='name'
                        label='Task Name'
                        fullWidth
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={isInvalidName}
                        helperText={
                            isInvalidName && 'タスク名を入力してください'
                        }
                    />
                    <TextField
                        autoFocus
                        margin='normal'
                        id='due-date'
                        label='Due Date'
                        placeholder='yyyy-mm-dd'
                        fullWidth
                        required
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        error={isInvalidDueDate}
                        helperText={
                            isInvalidDueDate && '日付形式で入力してください'
                        }
                    />
                    <FormControl fullWidth={true} margin='normal'>
                        <InputLabel id='task-status-label'>Status</InputLabel>
                        <Select
                            labelId='task-status-label'
                            id='task-status'
                            label='Status'
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value as TaskStatus)
                            }
                        >
                            <MenuItem value={'NOT_STARTED'}>
                                Not Started
                            </MenuItem>
                            <MenuItem value={'IN_PROGRESS'}>
                                In Progress
                            </MenuItem>
                            <MenuItem value={'COMPLETED'}>Completed</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        autoFocus
                        margin='normal'
                        id='description'
                        label='Description'
                        fullWidth
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleEditTask}>Update</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
