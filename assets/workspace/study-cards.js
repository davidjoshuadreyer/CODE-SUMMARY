/* Short conceptual retrieval only: no calculator or written working required. */
window.TESSELATE_STUDY_CARDS=[
 ['force-direction','phys210-0','Do two charges with the same sign attract or repel?','They repel. Opposite signs attract.'],
 ['field-direction','phys210-1','How is the direction of an electric field defined?','It is the direction of the force on a positive test charge.'],
 ['separable','math252-1','What makes a first-order differential equation separable?','It can be rearranged so that all y-dependent factors accompany dy and all x-dependent factors accompany dx.'],
 ['linear-ode','math252-2','What is the standard form of a first-order linear differential equation?','dy/dx + P(x)y = Q(x). The dependent variable and its derivative appear linearly.'],
 ['partial','calc-12.4','When taking a partial derivative with respect to x, what happens to the other independent variables?','They are held constant.'],
 ['gradient','calc-12.8','In which direction does the gradient point?','The direction of steepest increase of the function, when the gradient is nonzero.'],
 ['vacancy','engr290-2','What is a vacancy in a crystal?','An unoccupied site where an atom would normally be in the crystal lattice.'],
 ['dislocation','engr290-3','Why can obstacles to dislocation motion strengthen a metal?','Plastic deformation depends on dislocation motion. Hindering it increases the stress needed for plastic deformation.'],
 ['reference','comp139e-2','How does passing by reference differ from passing by value in C++?','A reference parameter aliases the original object and can modify it unless const. A value parameter receives a copy.'],
 ['pointer','comp139e-4','What does dereferencing a valid pointer do?','It accesses the object the pointer points to. Dereferencing a null or dangling pointer is invalid.'],
 ['series','ecet250e-1','What quantity is the same through resistors connected in series?','Current. There is only one path for charge flow.'],
 ['node','ecet250e-2','What conservation law underlies Kirchhoff’s current law?','Conservation of charge: total current entering a node equals total current leaving it.']
].map(([id,topic,front,back])=>({id:'seed-'+id,topic,front,back}));
