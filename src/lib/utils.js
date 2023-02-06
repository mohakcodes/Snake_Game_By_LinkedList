import { useEffect , useRef } from "react"

export function randomNumberGeneration(min , max)
{
    return Math.floor(Math.random() * (max-min+1) + min)
}

export function reverseLinkedList(head) {
    let prevNode = null;
    let currNode = head;
    while (currNode !== null) {
        const nextNode = currNode.next;
        currNode.next = prevNode;
        prevNode = currNode;
        currNode = nextNode;
    }
    return prevNode;
}

export function useInterval(callback, delay) {
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}