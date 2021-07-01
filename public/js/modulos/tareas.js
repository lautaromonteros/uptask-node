import axios from "axios";
import Swal from "sweetalert2";
import {actualizarAvance} from '../funciones/avances';

const tareas = document.querySelector('.listado-pendientes');

if(tareas){
    tareas.addEventListener('click', e => {
        if(e.target.classList.contains('fa-check-circle')){
            const icono = e.target;
            const idTarea = icono.parentElement.parentElement.dataset.tarea;
            
            // req hacia /tareas/:id
            const url = `${location.origin}/tareas/${idTarea}`;

            axios.patch(url, { idTarea })
                .then(function(respuesta){
                    if(respuesta.status === 200){
                        icono.classList.toggle('completo');

                        actualizarAvance();
                    }
                })
        }
        if(e.target.classList.contains('fa-trash')){
            const tareaHTML = e.target.parentElement.parentElement;
            const idTarea = tareaHTML.dataset.tarea;
            
            Swal.fire({
                title: 'Deseas borrar esta tarea?',
                text: "Una tarea eliminada no se puede recuperar!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Enviar peticion con Axios
                    const url = `${location.origin}/tareas/${idTarea} `;
                    
                    axios.delete(url, {params: {idTarea}})
                        .then(function(respuesta){
                            if(respuesta.status === 200){
                                tareaHTML.parentElement.removeChild(tareaHTML);
    
                                Swal.fire(
                                    'Tarea Eliminada!',
                                    respuesta.data,
                                    'success'
                                );

                                actualizarAvance();
                            }

                        })
                }
            })
            
        }
        
    })
}

export default tareas;