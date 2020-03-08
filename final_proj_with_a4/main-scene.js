window.final_proj = window.classes.final_proj =
class final_proj extends Scene_Component{
constructor(context, control_box) {
    // The scene begins by requesting the camera, shapes, and materials it will need.
    super(context, control_box);
    // First, include a secondary Scene that provides movement controls:
    if (!context.globals.has_controls)
        context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

    context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 10, 20), Vec.of(0, 0, 0), Vec.of(0, 1, 0));
    this.initial_camera_location = Mat4.inverse(context.globals.graphics_state.camera_transform);

    const r = context.width / context.height;
    context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

    const shapes = {
        ball: new Subdivision_Sphere(4),
        arena_cube: new Cube,
        bg: new Square,
        text: new Text_Line(100),
    };
    this.submit_shapes(context, shapes);

    // Make some Material objects available to you:
    this.materials =
        {
            arena_shade: context.get_instance(Phong_Shader).material(Color.of(0.76, 0.8, 0.85, 1), {ambient: 1, diffusivity: 1, specularity: 1}),
            ball_shade: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/earth.jpg", false)}),

        arena_shade1: context.get_instance(Phong_Shader).material(Color.of(0, 0.8, 0.6, 1), {ambient: 1}, {diffusivity: 1}, {specularity: 1}),
            arena_shade2: context.get_instance(Phong_Shader).material(Color.of(0, 0.6, 0.9, 1), {ambient: 1}, {diffusivity: 1}, {specularity: 1}),
            arena_shade3: context.get_instance(Phong_Shader).material(Color.of(0.5, 0.9, 0.4, 1), {ambient: 1}, {diffusivity: 1}, {specularity: 1}),
            arena_shade4: context.get_instance(Phong_Shader).material(Color.of(0.9, 0.9, 0, 1), {ambient: 1, diffusivity: 1, specularity: 1}),
            moon: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/moon.jpg", false)}),
            star_back: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/star_back.jpg", false)}),
            bricks: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/bricks.png", false)}),

            one: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/1-128.png", false)}),
            two: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/2-128.png", false)}),
            three: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/3-128.png", false)}),
            four: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/4-128.png", false)}),
            five: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/5-128.png", false)}),
            six: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/6-128.png", false)}),
            seven: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/7-128.png", false)}),
            eight: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/8-128.png", false)}),
            nine: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/9-128.png", false)}),
            zero: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/0-128.png", false)}),
            boom: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/boom.png", false)}),
            red_earth: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, diffusivity: 1, specularity: 1, texture:context.get_instance("assets/redearth.png", false)}),
        };

    this.texture_array = [this.materials.moon, this.materials.bricks, this.materials.arena_shade, this.materials.arena_shade1,this.materials.arena_shade4, this.materials.arena_shade2, this.materials.arena_shade3];

    this.lights = [new Light(Vec.of(0, 10, 5, 1), Color.of(1, 1, 1, 1), 1000)];
    this.acc = Vec.of(0, 0, 0);
    this.vel = Vec.of(0, 0, 0);
    this.pos = Vec.of(2, 2, 0);
    this.lastT = 0;

    this.forward = 0;
    this.backward = 0;
    this.left = 0;
    this.right = 0;

    this.accel_factor = 50;
    this.DRAG_COEFF = 0.1;

    this.start_forward();
    this.end_forward();
    this.arena = [[0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];


    this.z_pos = [0,2,3,4,5,6,7,8,9,10];

    let num_grids = 10;
    this.xy_pos = [[0,0]];
    this.grid_speed_factor = 50;
    this.initial_grid_dist = 80;
    this.z_pos[0] = -70;
    this.score = -1;
    this.score_flag = true;
    //This gets set when the game is over
    this.lose = 0;
    this.initial_lose_time = -1;

    this.level_texture = this.texture_array[0];

    this.sphere_radius = .5;
}


start_forward() {
    this.forward = 1;
}

end_forward() {
    this.forward = 0;
}

make_control_panel() {
    this.key_triggered_button( "Up",[ "i" ], () => this.forward =  1, undefined, () => this.forward = 0 );
    this.key_triggered_button( "Down",[ "k" ], () => this.backward =  1, undefined, () => this.backward = 0 );
    this.key_triggered_button( "Left",[ "j" ], () => this.left =  1, undefined, () => this.left = 0 );
    this.key_triggered_button( "Right",[ "l" ], () => this.right =  1, undefined, () => this.right = 0 );

}


display(graphics_state) {
    graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
    const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

    if (this.lose == 0) {
        this.z_pos[0] = (t * this.grid_speed_factor) % this.initial_grid_dist - (this.initial_grid_dist - 10);
        if (this.z_pos[0] > 8) {
            for (let i = 0; i < this.arena.length; i++) {
                for (let j = 0; j < this.arena.length; j++) {
                    this.arena[i][j] = Math.random() >= 0.6;
                }
            }
            this.xy_pos[0][0] = this.pos[0] - 16;
            this.xy_pos[0][1] = this.pos[1] - 16;
            let rand_level = Math.floor(Math.random() * (this.texture_array.length - .01));
            this.level_texture = this.texture_array[rand_level];

            if(this.score_flag) {
                this.score = (this.score + 1) % 100;
                this.score_flag = false;
            }
        }
    }
    if(this.z_pos[0] < -40){
        this.score_flag = true;
    }

    let background_trans = Mat4.identity();
    background_trans = background_trans.times(Mat4.translation([this.pos[0] + 1,this.pos[1] + 1,-50])).times(Mat4.scale([50,30,1]));
    this.shapes.bg.draw(graphics_state, background_trans, this.materials.star_back);

    let boxMinZ = this.z_pos[0] - 1;
    let boxMaxZ = this.z_pos[0] + 1;
    let sphere = this.pos;
    //do collison detect
    for (let i = 0; i < this.arena.length; i++) {
        for (let j = 0; j < this.arena.length; j++) {
            if (this.arena[i][j] == 0 || this.z_pos[0] < -2)
                continue;
            let boxMaxX = 2 * i + 1 + 1 + this.xy_pos[0][0];
            let boxMinX = 2 * i + 1 - 1 + this.xy_pos[0][0];
            let boxMaxY = 2 * j + 1 + 1 + this.xy_pos[0][1];
            let boxMinY = 2 * j + 1 - 1 + this.xy_pos[0][1];
            // get box closest point to sphere center by clamping
            let x = Math.max(boxMinX, Math.min(this.pos[0], boxMaxX));
            let y = Math.max(boxMinY, Math.min(this.pos[1], boxMaxY));
            let z = Math.max(boxMinZ, Math.min(this.pos[2], boxMaxZ));

            // this is the same as isPointInsideSphere
            let distance = Math.sqrt((x - this.pos[0]) * (x - this.pos[0]) +
                (y - this.pos[1]) * (y - this.pos[1]) +
                (z - this.pos[2]) * (z - this.pos[2]));

            if (distance < .5) {
                this.lose = 1;
                if(this.initial_lose_time == -1){
                    this.initial_lose_time = t;
                }
            }
        }
    }



    let arena_transform = Mat4.identity();
    arena_transform = arena_transform.times(Mat4.translation([2, 2, 2]));


    for (let i = 0; i < this.arena.length; i++) {
        for (let j = 0; j < this.arena.length; j++) {
            if (this.arena[i][j] == 1) {
                arena_transform = Mat4.translation([2 * i + 1 + this.xy_pos[0][0], 2 * j + 1 + this.xy_pos[0][1], this.z_pos[0]]);
                this.shapes.arena_cube.draw(graphics_state, arena_transform, this.level_texture);
            }
        }
    }


    let hori = this.accel_factor * (this.right - this.left);
    let vert = this.accel_factor * (this.forward - this.backward);
    this.acc = Vec.of(hori, vert, 0);

    this.vel = this.vel.minus(this.vel.times(this.DRAG_COEFF));
    this.vel = this.vel.plus(this.acc.times(dt));
    if (this.lose == 0) {//if the game is not over
        this.pos = this.pos.plus(this.vel.times(dt));
    }
    else //if the game is over
    {
        //this.pos = Vec.of(0,0,0);
    }

    let end_time = 0;

    if(this.lose == 1 && this.initial_lose_time != -1) {
        end_time = t - this.initial_lose_time;
    }

    let ball_transform = Mat4.identity().times(Mat4.translation(this.pos)).times(Mat4.scale([.5, .5, .5]));
    if(this.lose == 0) {
        this.shapes.ball.draw(graphics_state, ball_transform, this.materials.ball_shade);
    } else {
        this.shapes.ball.draw(graphics_state, ball_transform, this.materials.red_earth.override({color: Color.of(0, 0, 0, 1 - 0.2 * end_time)}));
    }


    let desired = Mat4.inverse(ball_transform.times(Mat4.rotation(this.vel[0] / 50, Vec.of(0, 0, 1))).times(Mat4.translation([0, 0, 20])));
    graphics_state.camera_transform = desired;
    this.lights = [new Light(Vec.of(this.pos[0],this.pos[1] - 3,10,1), Color.of(1, 1, 1, 1), 1000)];





    let score_transformation1 = Mat4.translation([8 + this.pos[0], 4 + this.pos[1], -2]).times(Mat4.scale([0.5, 0.5, 1]));
    let score_transformation2 = Mat4.translation([7 + this.pos[0], 4 + this.pos[1], -2]).times(Mat4.scale([0.5, 0.5, 1]));

    let score_oneth = this.score % 10;
    let score_tenth = (this.score - score_oneth) / 10;

    if(score_tenth == 1){
        this.shapes.bg.draw(graphics_state, score_transformation2, this.materials.one);
    } else if(score_tenth == 2){
        this.shapes.bg.draw(graphics_state, score_transformation2, this.materials.two);
    } else if(score_tenth == 3){
        this.shapes.bg.draw(graphics_state, score_transformation2, this.materials.three);
    } else if(score_tenth == 4){
        this.shapes.bg.draw(graphics_state, score_transformation2, this.materials.four);
    } else if(score_tenth == 5){
        this.shapes.bg.draw(graphics_state, score_transformation2, this.materials.five);
    } else if(score_tenth == 6){
        this.shapes.bg.draw(graphics_state, score_transformation2, this.materials.six);
    } else if(score_tenth == 7){
        this.shapes.bg.draw(graphics_state, score_transformation2, this.materials.seven);
    } else if(score_tenth == 8){
        this.shapes.bg.draw(graphics_state, score_transformation2, this.materials.eight);
    } else if(score_tenth == 9){
        this.shapes.bg.draw(graphics_state, score_transformation2, this.materials.nine);
    }

    if(score_oneth == 0) {
        this.shapes.bg.draw(graphics_state, score_transformation1, this.materials.zero);
    } else if(score_oneth == 1) {
        this.shapes.bg.draw(graphics_state, score_transformation1, this.materials.one);
    } else if(score_oneth == 2) {
        this.shapes.bg.draw(graphics_state, score_transformation1, this.materials.two);
    } else if(score_oneth == 3) {
        this.shapes.bg.draw(graphics_state, score_transformation1, this.materials.three);
    } else if(score_oneth == 4) {
        this.shapes.bg.draw(graphics_state, score_transformation1, this.materials.four);
    } else if(score_oneth == 5) {
        this.shapes.bg.draw(graphics_state, score_transformation1, this.materials.five);
    } else if(score_oneth == 6) {
        this.shapes.bg.draw(graphics_state, score_transformation1, this.materials.six);
    } else if(score_oneth == 7) {
        this.shapes.bg.draw(graphics_state, score_transformation1, this.materials.seven);
    } else if(score_oneth == 8) {
        this.shapes.bg.draw(graphics_state, score_transformation1, this.materials.eight);
    } else if(score_oneth == 9) {
        this.shapes.bg.draw(graphics_state, score_transformation1, this.materials.nine);
    }

    if(this.lose == 1 && this.initial_lose_time != -1){
        if(end_time > 4){
            end_time = 4;
        }
        let boom_transformation = Mat4.translation([0 + this.pos[0], 0.3 + this.pos[1], 1]).times(Mat4.scale([0.5, 0.5, 0.5]));
        this.shapes.bg.draw(graphics_state, boom_transformation, this.materials.boom.override({color: Color.of(0, 0, 0, 0.25*end_time)}));
    }
}
};

