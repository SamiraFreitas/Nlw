import { useParams} from 'react-router';
import { Button } from '../components/Button';
import LogoImg from '../assets/images/logo.svg';
import { RoomCode } from '../components/RoomCode';
import '../styles/room.scss';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';
import { useRoom } from '../hooks/useRoom';
import { Question } from '../components/Question';




type RoomParams = {
    id: string;
};


export function Room() {
    const { user }= useAuth();
    const params= useParams<RoomParams>();
    const [newQuestion, setNewQuestion] = useState(' ');
    const roomId = params.id;

    const { title, questions } = useRoom(roomId)
   


    async function handleSendQuestion(event: FormEvent) {
        event.preventDefault();
        if (newQuestion.trim() === "") {
          
            return;
        }
        if(!user){
            throw new Error('You must be logged in');
        }
        const question = {
            content: newQuestion,
            author: {
                name: user.name,
                avatar: user.avatar,
            },
            isHighlighted: false,
            isAnswered: false
        }
        await database.ref(`rooms/${roomId}/questions`).push(question);
        

        setNewQuestion("");
    }

    return (
        <div id='page-room'>
            <header>
                <div className="content">
                    <img src={LogoImg}alt='Letmeask'/>
                        <div>
                           <RoomCode code={roomId} />
                        </div>
                </div>
            </header>
            <main>
                <div className="room-title">
                <h1>Sala {title}</h1>
                    { questions.length > 0 && <span> {questions.length} pergunta(s)</span>}
                </div>
                <form onSubmit = {handleSendQuestion}>
                    <textarea 
                    placeholder='o que você quer perguntar'
                    onChange={event => setNewQuestion(event.target.value)}
                    value={newQuestion}
                    />
                    <div className='form-footer'>
                    {user ? (
                            <div className="user-info">
                                <img src={user.avatar} alt={user.name} />
                                <span>{user.name}</span>
                            </div>
                        ) : (
                            <span>
                                Pra enviar uma perguntar,
                                <button> faça seu login</button>.
                            </span>
                        )}
                   
                    <Button type='submit' disabled={!user}>Enviar pergunta</Button>
                    </div>
                </form>
                <div className="question-list">
                {questions.map(question => {
                    return (
                        <Question 
                        key= {question.id}
                        content={question.content}
                        author={question.author}/>
                    )
                })}
                </div>
            </main>
        </div>
        
    );
}