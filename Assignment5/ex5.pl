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
% sub_list([], _).
% sub_list([Sublist|Xs1], [Sublist|Xs2]) :- sub_list(Xs1, Xs2).
% sub_list([Sublist|Xs1], [_|Xs2]) :- sub_list([Sublist|Xs1], Xs2).



% Signature: sub_tree(Subtree, Tree)/2
% Purpose: Tree contains Subtree.
sub_tree(X, X).
sub_tree(X, tree(_E,L,_R)) :- sub_tree(X,L).
sub_tree(X, tree(_E,_L,R)) :- sub_tree(X,R).



% Signature: swap_tree(Tree, InversedTree)/2
% Purpose: InversedTree is the �mirror� representation of Tree.
% binary_tree(void).
% binary_tree(tree(_E,L,R)) :- binary_tree(L), binary_tree(R).
% swap_tree(tree(E,void,void), tree(E,void,void)).
% swap_tree(tree(E,L1,R1), tree(E,L2,R2)) :- swap_tree(L1,R2), swap_tree(R1,L2).
