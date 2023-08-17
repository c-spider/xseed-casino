function findOverlaps(str1, str2) {
    let ans = "";
    let longest = "";

    // Loop over the characters in the two strings
    for (let i = 0; i < str1.length; i++) {
        // If the characters are the same, add them to the answer
        if (str1[i] === str2[i]) {
            ans += str1[i];
            // If the current sequence is longer than the longest found so far, update longest
            if (ans.length > longest.length) {
                longest = ans;
            }
        }
        // If they are different, reset the current sequence
        else {
            ans = "";
        }
    }

    return longest;
}

export default function handler(req, res) {
    res.status(200).json({ value: findOverlaps(req.query.n1, req.query.n2) })
}
