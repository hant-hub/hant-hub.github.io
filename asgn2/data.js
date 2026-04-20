

/*
    Each frame is an array of objects, made of
    the cube handle and the vec3 with
    the key framed rotation.
*/
const walk_animation = [
    [{ "handle": 1, "rot": [0, 0, 0] }, { "handle": 11, "rot": [0, 0, 0] }, { "handle": 2, "rot": [0, 0, 30] }, { "handle": 3, "rot": [0, 0, -42] }, { "handle": 5, "rot": [0, 0, 28] }, { "handle": 8, "rot": [0, 0, -34] }, { "handle": 6, "rot": [0, 0, 0] }, { "handle": 9, "rot": [0, 0, 0] }, { "handle": 7, "rot": [0, 0, -18] }, { "handle": 10, "rot": [0, 0, 23] }, { "handle": 12, "rot": [0, 0, -13] }, { "handle": 15, "rot": [0, 0, -32] }, { "handle": 13, "rot": [0, 0, -20] }, { "handle": 16, "rot": [0, 0, -35] }, { "handle": 14, "rot": [0, 0, 31] }, { "handle": 17, "rot": [0, 0, -18] }, { "handle": 18, "rot": [0, 0, 0] }],
    [{ "handle": 1, "rot": [0, 0, 0] }, { "handle": 11, "rot": [0, 0, 0] }, { "handle": 2, "rot": [0, 0, 30] }, { "handle": 3, "rot": [0, 0, -42] }, { "handle": 5, "rot": [0, 0, 6] }, { "handle": 8, "rot": [0, 0, -35] }, { "handle": 6, "rot": [0, 0, 0] }, { "handle": 9, "rot": [0, 0, 0] }, { "handle": 7, "rot": [0, 0, -8] }, { "handle": 10, "rot": [0, 0, 6] }, { "handle": 12, "rot": [0, 0, -11] }, { "handle": 15, "rot": [0, 0, 16] }, { "handle": 13, "rot": [0, 0, -20] }, { "handle": 16, "rot": [0, 0, -89] }, { "handle": 14, "rot": [0, 0, 31] }, { "handle": 17, "rot": [0, 0, -18] }, { "handle": 18, "rot": [0, 0, 0] }],
    [{ "handle": 1, "rot": [0, 0, 0] }, { "handle": 11, "rot": [0, 0, 0] }, { "handle": 2, "rot": [0, 0, 30] }, { "handle": 3, "rot": [0, 0, -42] }, { "handle": 5, "rot": [0, 0, -3] }, { "handle": 8, "rot": [0, 0, -27] }, { "handle": 6, "rot": [0, 0, 0] }, { "handle": 9, "rot": [0, 0, 85] }, { "handle": 7, "rot": [0, 0, 2] }, { "handle": 10, "rot": [0, 0, -68] }, { "handle": 12, "rot": [0, 0, -37] }, { "handle": 15, "rot": [0, 0, 21] }, { "handle": 13, "rot": [0, 0, -6] }, { "handle": 16, "rot": [0, 0, 0] }, { "handle": 14, "rot": [0, 0, -10] }, { "handle": 17, "rot": [0, 0, -18] }, { "handle": 18, "rot": [0, 0, 0] }],
    [{ "handle": 1, "rot": [0, 0, 0] }, { "handle": 11, "rot": [0, 0, 0] }, { "handle": 2, "rot": [0, 0, 30] }, { "handle": 3, "rot": [0, 0, -42] }, { "handle": 5, "rot": [0, 0, -27] }, { "handle": 8, "rot": [0, 0, 47] }, { "handle": 6, "rot": [0, 0, 0] }, { "handle": 9, "rot": [0, 0, 2] }, { "handle": 7, "rot": [0, 0, 2] }, { "handle": 10, "rot": [0, 0, -13] }, { "handle": 12, "rot": [0, 0, -35] }, { "handle": 15, "rot": [0, 0, 2] }, { "handle": 13, "rot": [0, 0, -6] }, { "handle": 16, "rot": [0, 0, 0] }, { "handle": 14, "rot": [0, 0, -1] }, { "handle": 17, "rot": [0, 0, -34] }, { "handle": 18, "rot": [0, 0, 0] }],
    [{ "handle": 1, "rot": [0, 0, 0] }, { "handle": 11, "rot": [0, 0, 0] }, { "handle": 2, "rot": [0, 0, 30] }, { "handle": 3, "rot": [0, 0, -42] }, { "handle": 5, "rot": [0, 0, -29] }, { "handle": 8, "rot": [0, 0, 21] }, { "handle": 6, "rot": [0, 0, 0] }, { "handle": 9, "rot": [0, 0, 2] }, { "handle": 7, "rot": [0, 0, 2] }, { "handle": 10, "rot": [0, 0, -13] }, { "handle": 12, "rot": [0, 0, -11] }, { "handle": 15, "rot": [0, 0, 2] }, { "handle": 13, "rot": [0, 0, -65] }, { "handle": 16, "rot": [0, 0, 0] }, { "handle": 14, "rot": [0, 0, -1] }, { "handle": 17, "rot": [0, 0, -25] }, { "handle": 18, "rot": [0, 0, 0] }],
    [{ "handle": 1, "rot": [0, 0, 0] }, { "handle": 11, "rot": [0, 0, 0] }, { "handle": 2, "rot": [0, 0, 30] }, { "handle": 3, "rot": [0, 0, -42] }, { "handle": 5, "rot": [0, 0, -32] }, { "handle": 8, "rot": [0, 0, 11] }, { "handle": 6, "rot": [0, 0, 90] }, { "handle": 9, "rot": [0, 0, -3] }, { "handle": 7, "rot": [0, 0, -53] }, { "handle": 10, "rot": [0, 0, -13] }, { "handle": 12, "rot": [0, 0, 49] }, { "handle": 15, "rot": [0, 0, 0] }, { "handle": 13, "rot": [0, 0, -97] }, { "handle": 16, "rot": [0, 0, 0] }, { "handle": 14, "rot": [0, 0, -1] }, { "handle": 17, "rot": [0, 0, -25] }, { "handle": 18, "rot": [0, 0, 0] }],
    [{ "handle": 1, "rot": [0, 0, 0] }, { "handle": 11, "rot": [0, 0, 0] }, { "handle": 2, "rot": [0, 0, 30] }, { "handle": 3, "rot": [0, 0, -42] }, { "handle": 5, "rot": [0, 0, -10] }, { "handle": 8, "rot": [0, 0, -15] }, { "handle": 6, "rot": [0, 0, 59] }, { "handle": 9, "rot": [0, 0, 25] }, { "handle": 7, "rot": [0, 0, -53] }, { "handle": 10, "rot": [0, 0, -13] }, { "handle": 12, "rot": [0, 0, 38] }, { "handle": 15, "rot": [0, 0, -23] }, { "handle": 13, "rot": [0, 0, -15] }, { "handle": 16, "rot": [0, 0, -6] }, { "handle": 14, "rot": [0, 0, -1] }, { "handle": 17, "rot": [0, 0, 23] }, { "handle": 18, "rot": [0, 0, 0] }],
    [{ "handle": 1, "rot": [0, 0, 0] }, { "handle": 11, "rot": [0, 0, 0] }, { "handle": 2, "rot": [0, 0, 30] }, { "handle": 3, "rot": [0, 0, -42] }, { "handle": 5, "rot": [0, 0, 40] }, { "handle": 8, "rot": [0, 0, -15] }, { "handle": 6, "rot": [0, 0, 1] }, { "handle": 9, "rot": [0, 0, 25] }, { "handle": 7, "rot": [0, 0, -53] }, { "handle": 10, "rot": [0, 0, -13] }, { "handle": 12, "rot": [0, 0, 11] }, { "handle": 15, "rot": [0, 0, -30] }, { "handle": 13, "rot": [0, 0, -15] }, { "handle": 16, "rot": [0, 0, -6] }, { "handle": 14, "rot": [0, 0, -1] }, { "handle": 17, "rot": [0, 0, 23] }, { "handle": 18, "rot": [0, 0, 0] }],
]

const sit_animation = [
    [{"handle":1,"rot":[0,0,0]},{"handle":11,"rot":[0,0,0]},{"handle":2,"rot":[0,0,30]},{"handle":3,"rot":[0,0,-42]},{"handle":5,"rot":[0,0,17]},{"handle":8,"rot":[0,0,-34.5]},{"handle":6,"rot":[0,0,0]},{"handle":9,"rot":[0,0,0]},{"handle":7,"rot":[0,0,-13]},{"handle":10,"rot":[0,0,14.5]},{"handle":12,"rot":[0,0,-12]},{"handle":15,"rot":[0,0,-8]},{"handle":13,"rot":[0,0,-20]},{"handle":16,"rot":[0,0,-62]},{"handle":14,"rot":[0,0,31]},{"handle":17,"rot":[0,0,-18]},{"handle":18,"rot":[0,0,0]}],
    [{"handle":1,"rot":[0,0,0]},{"handle":11,"rot":[0,0,16]},{"handle":2,"rot":[0,0,30]},{"handle":3,"rot":[0,0,-42]},{"handle":5,"rot":[0,0,-1]},{"handle":8,"rot":[2,2,-8]},{"handle":6,"rot":[0,0,0]},{"handle":9,"rot":[0,0,0]},{"handle":7,"rot":[0,0,6]},{"handle":10,"rot":[0,0,2]},{"handle":12,"rot":[0,0,23]},{"handle":15,"rot":[0,0,30]},{"handle":13,"rot":[0,0,-44]},{"handle":16,"rot":[0,0,-41]},{"handle":14,"rot":[0,0,-1]},{"handle":17,"rot":[0,0,2]},{"handle":18,"rot":[0,0,0]}],
    [{"handle":1,"rot":[0,0,13]},{"handle":11,"rot":[0,0,54]},{"handle":2,"rot":[0,0,-10]},{"handle":3,"rot":[0,0,-18]},{"handle":5,"rot":[0,0,-13]},{"handle":8,"rot":[2,2,-13]},{"handle":6,"rot":[0,0,0]},{"handle":9,"rot":[0,0,0]},{"handle":7,"rot":[0,0,6]},{"handle":10,"rot":[0,0,2]},{"handle":12,"rot":[0,0,62]},{"handle":15,"rot":[0,0,59]},{"handle":13,"rot":[0,0,-137]},{"handle":16,"rot":[0,0,-140]},{"handle":14,"rot":[0,0,-1]},{"handle":17,"rot":[0,0,2]},{"handle":18,"rot":[0,0,-68]}],
]

const stand_animation = [
    [{"handle":1,"rot":[0,0,13]},{"handle":11,"rot":[0,0,54]},{"handle":2,"rot":[0,0,-10]},{"handle":3,"rot":[0,0,-18]},{"handle":5,"rot":[0,0,-13]},{"handle":8,"rot":[2,2,-13]},{"handle":6,"rot":[0,0,0]},{"handle":9,"rot":[0,0,0]},{"handle":7,"rot":[0,0,6]},{"handle":10,"rot":[0,0,2]},{"handle":12,"rot":[0,0,62]},{"handle":15,"rot":[0,0,59]},{"handle":13,"rot":[0,0,-137]},{"handle":16,"rot":[0,0,-140]},{"handle":14,"rot":[0,0,-1]},{"handle":17,"rot":[0,0,2]},{"handle":18,"rot":[0,0,-68]}],
    [{"handle":1,"rot":[0,0,0]},{"handle":11,"rot":[0,0,16]},{"handle":2,"rot":[0,0,30]},{"handle":3,"rot":[0,0,-42]},{"handle":5,"rot":[0,0,-1]},{"handle":8,"rot":[2,2,-8]},{"handle":6,"rot":[0,0,0]},{"handle":9,"rot":[0,0,0]},{"handle":7,"rot":[0,0,6]},{"handle":10,"rot":[0,0,2]},{"handle":12,"rot":[0,0,23]},{"handle":15,"rot":[0,0,30]},{"handle":13,"rot":[0,0,-44]},{"handle":16,"rot":[0,0,-41]},{"handle":14,"rot":[0,0,-1]},{"handle":17,"rot":[0,0,2]},{"handle":18,"rot":[0,0,0]}],
    [{"handle":1,"rot":[0,0,0]},{"handle":11,"rot":[0,0,0]},{"handle":2,"rot":[0,0,30]},{"handle":3,"rot":[0,0,-42]},{"handle":5,"rot":[0,0,17]},{"handle":8,"rot":[0,0,-34.5]},{"handle":6,"rot":[0,0,0]},{"handle":9,"rot":[0,0,0]},{"handle":7,"rot":[0,0,-13]},{"handle":10,"rot":[0,0,14.5]},{"handle":12,"rot":[0,0,-12]},{"handle":15,"rot":[0,0,-8]},{"handle":13,"rot":[0,0,-20]},{"handle":16,"rot":[0,0,-62]},{"handle":14,"rot":[0,0,31]},{"handle":17,"rot":[0,0,-18]},{"handle":18,"rot":[0,0,0]}],
]

const sit_idle = [
    [{"handle":1,"rot":[0,0,13]},{"handle":11,"rot":[0,0,54]},{"handle":2,"rot":[0,0,-10]},{"handle":3,"rot":[0,0,-18]},{"handle":5,"rot":[0,0,-13]},{"handle":8,"rot":[2,2,-13]},{"handle":6,"rot":[0,0,0]},{"handle":9,"rot":[0,0,0]},{"handle":7,"rot":[0,0,6]},{"handle":10,"rot":[0,0,2]},{"handle":12,"rot":[0,0,62]},{"handle":15,"rot":[0,0,59]},{"handle":13,"rot":[0,0,-137]},{"handle":16,"rot":[0,0,-140]},{"handle":14,"rot":[0,0,-1]},{"handle":17,"rot":[0,0,2]},{"handle":18,"rot":[0,0,-68]}],
    [{"handle":1,"rot":[0,0,13]},{"handle":11,"rot":[0,0,54]},{"handle":2,"rot":[0,0,-10]},{"handle":3,"rot":[0,-48,-10]},{"handle":5,"rot":[0,0,-13]},{"handle":8,"rot":[2,2,-13]},{"handle":6,"rot":[0,0,0]},{"handle":9,"rot":[0,0,0]},{"handle":7,"rot":[0,0,6]},{"handle":10,"rot":[0,0,2]},{"handle":12,"rot":[0,0,62]},{"handle":15,"rot":[0,0,59]},{"handle":13,"rot":[0,0,-137]},{"handle":16,"rot":[0,0,-140]},{"handle":14,"rot":[0,0,-1]},{"handle":17,"rot":[0,0,2]},{"handle":18,"rot":[0,0,-68]}],
    [{"handle":1,"rot":[0,0,13]},{"handle":11,"rot":[0,0,54]},{"handle":2,"rot":[0,0,-10]},{"handle":3,"rot":[0,0,-18]},{"handle":5,"rot":[0,0,-13]},{"handle":8,"rot":[2,2,-13]},{"handle":6,"rot":[0,0,0]},{"handle":9,"rot":[0,0,0]},{"handle":7,"rot":[0,0,6]},{"handle":10,"rot":[0,0,2]},{"handle":12,"rot":[0,0,62]},{"handle":15,"rot":[0,0,59]},{"handle":13,"rot":[0,0,-137]},{"handle":16,"rot":[0,0,-140]},{"handle":14,"rot":[0,0,-1]},{"handle":17,"rot":[0,0,2]},{"handle":18,"rot":[0,0,-68]}],
    [{"handle":1,"rot":[0,0,13]},{"handle":11,"rot":[0,0,54]},{"handle":2,"rot":[0,0,-10]},{"handle":3,"rot":[0,48,-18]},{"handle":5,"rot":[0,0,-13]},{"handle":8,"rot":[2,2,-13]},{"handle":6,"rot":[0,0,0]},{"handle":9,"rot":[0,0,0]},{"handle":7,"rot":[0,0,6]},{"handle":10,"rot":[0,0,2]},{"handle":12,"rot":[0,0,62]},{"handle":15,"rot":[0,0,59]},{"handle":13,"rot":[0,0,-137]},{"handle":16,"rot":[0,0,-140]},{"handle":14,"rot":[0,0,-1]},{"handle":17,"rot":[0,0,2]},{"handle":18,"rot":[0,0,-68]}],
    [{"handle":1,"rot":[0,0,13]},{"handle":11,"rot":[0,0,54]},{"handle":2,"rot":[0,0,-10]},{"handle":3,"rot":[0,0,-18]},{"handle":5,"rot":[0,0,-13]},{"handle":8,"rot":[2,2,-13]},{"handle":6,"rot":[0,0,0]},{"handle":9,"rot":[0,0,0]},{"handle":7,"rot":[0,0,6]},{"handle":10,"rot":[0,0,2]},{"handle":12,"rot":[0,0,62]},{"handle":15,"rot":[0,0,59]},{"handle":13,"rot":[0,0,-137]},{"handle":16,"rot":[0,0,-140]},{"handle":14,"rot":[0,0,-1]},{"handle":17,"rot":[0,0,2]},{"handle":18,"rot":[0,0,-68]}],
    [{"handle":1,"rot":[0,0,13]},{"handle":11,"rot":[0,0,54]},{"handle":2,"rot":[0,0,-10]},{"handle":3,"rot":[0,0,-18]},{"handle":5,"rot":[0,0,-13]},{"handle":8,"rot":[2,2,-13]},{"handle":6,"rot":[0,0,0]},{"handle":9,"rot":[0,0,0]},{"handle":7,"rot":[0,0,6]},{"handle":10,"rot":[0,0,2]},{"handle":12,"rot":[0,0,62]},{"handle":15,"rot":[0,0,59]},{"handle":13,"rot":[0,0,-137]},{"handle":16,"rot":[0,0,-140]},{"handle":14,"rot":[0,0,-1]},{"handle":17,"rot":[0,0,2]},{"handle":18,"rot":[0,0,-68]}],
    [{"handle":1,"rot":[0,0,13]},{"handle":11,"rot":[0,0,54]},{"handle":2,"rot":[0,0,-10]},{"handle":3,"rot":[0,0,-18]},{"handle":5,"rot":[0,0,-13]},{"handle":8,"rot":[2,2,-13]},{"handle":6,"rot":[0,0,0]},{"handle":9,"rot":[0,0,0]},{"handle":7,"rot":[0,0,6]},{"handle":10,"rot":[0,0,2]},{"handle":12,"rot":[0,0,62]},{"handle":15,"rot":[0,0,59]},{"handle":13,"rot":[0,0,-137]},{"handle":16,"rot":[0,0,-140]},{"handle":14,"rot":[0,0,-1]},{"handle":17,"rot":[0,0,2]},{"handle":18,"rot":[0,0,-68]}],
]

const animation_data = {
    "walk": { 
        anim: walk_animation,
        speed: 1.0,
        loop: true,
        bob: 1.0,
    },

    "sit": {
        anim: sit_animation,
        speed: 0.5,
        loop: false,
        bob: 0.0,
    },

    "sit-idle": {
        anim: sit_idle,
        speed: 0.3,
        loop: true,
        bob: 0.8,
    },

    "sit-rev": {
        anim: stand_animation,
        speed: 0.5,
        loop: false,
        bob: 0.0,
    },
};
