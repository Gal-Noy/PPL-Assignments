/*
 * **********************************************
 * Printing result depth
 *
 * You can enlarge it, if needed.
 * **********************************************
 */
maximum_printing_depth(100).

:- current_prolog_flag(toplevel_print_options, A),
   (select(max_depth(_), A, B), ! ; A = B),
   maximum_printing_depth(MPD),
   set_prolog_flag(toplevel_print_options, [max_depth(MPD)|B]).

% Signature: sub_list(Sublist, List)/2
% Purpose: All elements in Sublist appear in List in the same order.
% Precondition: List is fully instantiated (queries do not include variables in their second argument).
sub_list([], _).
sub_list([H|T1], [H|T2]) :- sub_list(T1, T2).
sub_list([H|T1], [_|T2]) :- sub_list([H|T1], T2).



% Signature: sub_tree(Subtree, Tree)/2
% Purpose: Tree contains Subtree.
sub_tree(tree(E,L,R), tree(E,L,R)).
sub_tree(X, tree(_E,L,_R)) :- sub_tree(X,L).
sub_tree(X, tree(_E,_L,R)) :- sub_tree(X,R).



% Signature: swap_tree(Tree, InversedTree)/2
% Purpose: InversedTree is the �mirror� representation of Tree.
swap_tree(void, void).
swap_tree(tree(E,L1,R1), tree(E,L2,R2)) :- swap_tree(L1,R2), swap_tree(R1,L2).
