const express = require('express');
const cors = require('cors');

//const path = require('path');


const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());


var robo_Controller = {
    dangerZone: [],
    
    min_X: 0,
    min_Y: 0,

    max_X: null,
    max_Y: null,

    inDangerZone(obj){
        let inDanger = null;
        this.dangerZone.forEach(element => {
                
            if( (obj.X === element.X) && (obj.Y === element.Y) && (obj.O === element.O) ){                                                
                inDanger = true;
            }
            else{
                inDanger = false;
            }                                   
        });
        return inDanger            
    },
    isLost(obj){
        let hasLost = false
        if( ( (obj.X < this.min_X) || (obj.Y < this.min_Y) ) || 
            ( (obj.X > this.max_X) || (obj.Y > this.max_Y) ) ){
                hasLost = true
        }
        else{
            hasLost = false                    
        }
        return hasLost
    },
    changeOrientLeft(obj){
        switch(obj.O){
            case 'E':
                obj.O = 'N';   
                break;                             
            case 'W':
                obj.O = 'S';
                break;
            case 'N':
                obj.O = 'W';
                break;
            case 'S':
                obj.O = 'E';
                break;
            default:
                break;
        }       
    },
    changeOrientRight(obj){
        switch(obj.O){
            case 'E':
                obj.O = 'S';
                break;
            case 'W':
                obj.O = 'N';
                break;
            case 'N':
                obj.O = 'E';
                break;
            case 'S':
                obj.O = 'W';
                break;
            default:
                break;
        }
    },
    move(obj){ 
        switch(obj.O){
            case 'E':                
                obj.X = Number(Number(obj.X) + Number(1))
                if(this.isLost(obj)){
                    obj.isLost = true
                    this.update_DangerZone({X: Number(obj.X) - 1 , Y: obj.Y, O: obj.O})
                }                                 
                break;
            case 'W':
                obj.X = Number(Number(obj.X) - Number(1))
                if(this.isLost(obj)){
                    obj.isLost = true
                    this.update_DangerZone({X: Number(obj.X) + 1 , Y: obj.Y, O: obj.O})
                }
                break;
            case 'N':
                obj.Y = Number(Number(obj.Y) + Number(1))
                if(this.isLost(obj)){
                    obj.isLost = true
                    this.update_DangerZone({X: obj.X, Y: Number(obj.Y) - 1 , O: obj.O})
                }
                break;
            case 'S':
                obj.Y = Number(Number(obj.Y) - Number(1))                
                if(this.isLost(obj)){
                    obj.isLost = true
                    this.update_DangerZone({X: obj.X, Y: Number(obj.Y) + 1 , O: obj.O})
                }
                break;
            default:
                break;
        }             
    },
    update_DangerZone(obj){                
            this.dangerZone.push(obj)        
    },
    completeOrders(obj){ 
        if(this.isLost(obj)){
            obj.isLost = true
        }
        else{
            obj.instructions.forEach(instruction => {            
                if(!obj.isLost){       
                    switch(instruction){                    
                        case 'L':
                            this.changeOrientLeft(obj)                    
                            break;                       
                        case 'R':
                            this.changeOrientRight(obj)                             
                            break;                       
                        case 'F':  
                            if(!this.inDangerZone(obj)){
                                this.move(obj)                                
                            }             
                            break;                       
                        default: 
                        break;                        
                    }                 
                }                
            }, this);
        }
    },            
}

 app.get('/', (req, res)=>{
    res.send("Robots are Running");
}) 

//app.use(express.static(path.join(__dirname, './public')));


app.post('/orderRobot', (req, res)=>{    

    var {gridSize, robots} = req.body; 

    robo_Controller.max_X = gridSize[0]
    robo_Controller.max_Y = gridSize[1]
      
    var robot1 = {
        isLost: false,
        X: robots[0].orientation[0],
        Y: robots[0].orientation[1],
        O: robots[0].orientation[2],
        instructions: robots[0].instructions
    }
    robo_Controller.completeOrders(robot1)

    var robot2 = {
        isLost: false,
        X: robots[1].orientation[0],
        Y: robots[1].orientation[1],
        O: robots[1].orientation[2],
        instructions: robots[1].instructions
    }
    robo_Controller.completeOrders(robot2)

    var robot3 = {
        isLost: false,
        X: robots[2].orientation[0],
        Y: robots[2].orientation[1],
        O: robots[2].orientation[2],
        instructions: robots[2].instructions
    }
    robo_Controller.completeOrders(robot3)

    console.log("Danger Zone:", robo_Controller.dangerZone)
    
    res.status(200).json([robot1, robot2, robot3])
})


app.listen(port, ()=>{
    console.log(`server started at port ${port}`);
});