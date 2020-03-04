


class Cube extends Shape {
    // Here's a complete, working example of a Shape subclass.  It is a blueprint for a cube.
    constructor() {
        super("positions", "normals"); // Name the values we'll define per each vertex.  They'll have positions and normals.

        // First, specify the vertex positions -- just a bunch of points that exist at the corners of an imaginary cube.
        this.positions.push(...Vec.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]));
        // Supply vectors that point away from eace face of the cube.  They should match up with the points in the above list
        // Normal vectors are needed so the graphics engine can know if the shape is pointed at light or not, and color it accordingly.
        this.normals.push(...Vec.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]));

        // Those two lists, positions and normals, fully describe the "vertices".  What's the "i"th vertex?  Simply the combined
        // data you get if you look up index "i" of both lists above -- a position and a normal vector, together.  Now let's
        // tell it how to connect vertex entries into triangles.  Every three indices in this list makes one triangle:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
        // It stinks to manage arrays this big.  Later we'll show code that generates these same cube vertices more automatically.

    }
};



window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
    class Assignment_Three_Scene extends Scene_Component {
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

            };
            this.submit_shapes(context, shapes);

            // Make some Material objects available to you:
            this.materials =
                {
                    arena_shade: context.get_instance(Phong_Shader).material(Color.of(0.76, 0.8, 0.85, 1), {ambinet: 1}, {diffusivity: 1}, {specularity: 1}),
                    ball_shade: context.get_instance(Phong_Shader).material(Color.of(0.5, 0.4, 0.15, 1), {ambinet: 1, diffusivity: 1, specularity: 1}),
                };

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

            //This gets set when the game is over
            this.lose = 0;

            this.sphere_radius = .5
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


                this.z_pos[0] = (t * this.grid_speed_factor) % this.initial_grid_dist - (this.initial_grid_dist - 10);
                if (this.z_pos[0] > 8) {
                    for (let i = 0; i < this.arena.length; i++) {
                        for (let j = 0; j < this.arena.length; j++) {
                            this.arena[i][j] = Math.random() >= 0.6;
                        }
                    }
                    this.xy_pos[0][0] = this.pos[0] - 16;
                    this.xy_pos[0][1] = this.pos[1] - 16;
                }

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
                        }
                    }
                }



                let arena_transform = Mat4.identity();
                arena_transform = arena_transform.times(Mat4.translation([2, 2, 2]));

                for (let i = 0; i < this.arena.length; i++) {
                    for (let j = 0; j < this.arena.length; j++) {
                        if (this.arena[i][j] == 1) {
                            arena_transform = Mat4.translation([2 * i + 1 + this.xy_pos[0][0], 2 * j + 1 + this.xy_pos[0][1], this.z_pos[0]]);
                            this.shapes.arena_cube.draw(graphics_state, arena_transform, this.materials.arena_shade);
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
                    this.pos = Vec.of(0,0,0);
                }

                let ball_transform = Mat4.identity().times(Mat4.translation(this.pos)).times(Mat4.scale([.5, .5, .5]));
                this.shapes.ball.draw(graphics_state, ball_transform, this.materials.ball_shade);


                let desired = Mat4.inverse(ball_transform.times(Mat4.rotation(this.vel[0] / 50, Vec.of(0, 0, 1))).times(Mat4.translation([0, 0, 20])));
                graphics_state.camera_transform = desired;
                this.lights = [new Light(Vec.of(this.pos[0],this.pos[1] - 3,10,1), Color.of(1, 1, 1, 1), 1000)];

        }
    };


//could add large textured plane behind everything