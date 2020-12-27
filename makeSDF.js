function makeSDF(data){
    //Offset and Scale should be passed as uniform
    const functionHead = 
        'float SDF(vec3 pos){\n'+
        'vec3 p = pos;\n' +
        'const int Iterations = '+ data.Iterations.toString() + ';\n'+
        'int rescale = 0;\n'+
        'for(int n=0;n<Iterations;n++){\n';
    const functionTail = 
        '}\n'+
        'return (length(p)- AtomSize) * pow(Scale, -float(rescale));\n'+
        '}\n';
    
    var ans = '';
    ans += functionHead;
    for(i=0;i<5;i++){
        ans = ans + genTransform(data.transforms[i]);
    }
    ans += functionTail;
    console.log(ans);
    return ans;
    
}


const genTransform = function(t){
    if(t.type == 'translate'){
        //t.axis should be defined
        return 'p += Offset * ((Scale-1.0)/Scale) * '+vec3ToString(t.axis)+';\n';
    }
    else if(t.type == 'rotate'){
        //t.axis and t.theta should be defined
        return 'p = rotate(p, ' + vec3ToString(t.axis) +', '+str(t.theta) + ');\n';
    }else if(t.type == 'reflect_tetra_1'){
        const ans =  
        'if(p.x+p.y<0.0) p.xy = -p.yx; // fold 1\n'+
        'if(p.x+p.z<0.0) p.zx = -p.xz; // fold 2\n'+
        'if(p.y+p.z<0.0) p.yz = -p.zy; // fold 3\n';
        return ans;
    }else if(t.type == 'reflect_tetra_2'){
        const ans = 
        'if(p.x-p.y<0.0) p.xy = p.yx; // fold 1\n'+
        'if(p.x-p.z<0.0) p.xz = p.zx; // fold 2\n'+
        'if(p.y-p.z<0.0) p.yz = p.zy; // fold 3\n';
        return ans;
    }else if(t.type == 'reflect_square'){
        return 'p = abs(p);\n';
    }else if(t.type == 'reflect_octa'){
        const ans = 
        'if(p.x-p.y<0)p.xy = p.yz;\n'+
        'if(p.x+p.y<0)p.xy =-p.yx;\n'+
        'if(p.x-p.z<0)p.xz = p.zx;\n'+
        'if(p.x+p.z<0)p.xz =-p.zx;\n';
        return ans;
    }else if(t.type == 'scale'){
        return 'p = Scale*p - Offset*(Scale-1.0);rescale+=1;\n';
    }else{ // custom
        //source should be defined
        return '\n'+t.source+'\n';
    }
}

const vec3ToString = function(v){
    return 'vec3('+str(v[1])+', '+str(v[2])+', '+str(v[3])+')'; 
}

const str = (f)=>{return f.toFixed(2).toString();}