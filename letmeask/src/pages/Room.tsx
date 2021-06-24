import { useParams} from 'react-router';
import { Button } from '../components/Button';
import LogoImg from '../assets/images/logo.svg';
import { RoomCode } from '../components/RoomCode';
import '../styles/room.scss';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';

type FirebaseQuestions = Record<
    string,
    {
        author: {
            name: string;
            avatar: string;
        };
        content: string;
        isAnswered: boolean;
        isHighlighted: boolean;
    }
>;
type Question = {
    id: string;
    author: {
        name: string;
        avatar: string;
    };
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;
};
type RoomParams = {
    id: string;
};


export function Room() {
    const { user }= useAuth();
    const params= useParams<RoomParams>();
    const roomId = params.id;
    const [newQuestion, setNewQuestion] = useState(' ');
    const [question, setQuestion] = useState<Question[]>([]);
    const [Title, setTitle] = useState("");

    useEffect(()=> {
        const roomRef = database.ref(`rooms/${roomId}`);
        
        roomRef.on ('value', room => {
            const databaseRoom = room.val();

            const firebaseQuestions: FirebaseQuestions =
                databaseRoom.questions ?? {};

            const parsedQuestions = Object.entries(firebaseQuestions).map(
                ([key, value]) => {
                    return {
                        id: key,
                        content: value.content,
                        author: value.author,
                        isAnswered: value.isAnswered,
                        isHighlighted: value.isHighlighted,
                    };
                } )

            setTitle(databaseRoom.title);
            setQuestion(parsedQuestions);

        })
    }, [roomId]); 


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
                <h1>Sala {Title}</h1>
                    { question.length > 0 && <span> {question.length} pergunta(s)</span>}
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
                {JSON.stringify(question)}
            </main>
        </div>
        
    );
}